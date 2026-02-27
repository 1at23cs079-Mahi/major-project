// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ConsentManager
 * @notice Manages patient consent for data access
 * @dev Stores ONLY hashed IDs - NO sensitive data on-chain
 * 
 * Privacy Design:
 * - Patient IDs are hashed before storage
 * - Doctor IDs are hashed before storage
 * - No personal information stored
 * - Consent status publicly verifiable
 */
contract ConsentManager is AccessControl, ReentrancyGuard {
    bytes32 public constant CONSENT_ADMIN_ROLE = keccak256("CONSENT_ADMIN_ROLE");
    bytes32 public constant HEALTHCARE_PROVIDER_ROLE = keccak256("HEALTHCARE_PROVIDER_ROLE");

    // Enum for consent types
    enum ConsentType {
        FULL_ACCESS,           // Full medical record access
        PRESCRIPTION_ONLY,     // Only prescription access
        APPOINTMENT_ONLY,      // Only appointment access
        LAB_RESULTS_ONLY,      // Only lab results
        EMERGENCY_ONLY,        // Emergency access only
        INSURANCE_SHARING,     // Share with insurance
        RESEARCH_PARTICIPATION // Anonymized research data
    }

    // Consent status
    enum ConsentStatus {
        PENDING,
        GRANTED,
        REVOKED,
        EXPIRED
    }

    // Struct for consent record
    struct ConsentRecord {
        bytes32 patientId;        // Hashed patient ID
        bytes32 granteeId;        // Hashed doctor/provider ID
        ConsentType consentType;  // Type of consent
        ConsentStatus status;     // Current status
        uint256 grantedAt;        // When consent was granted
        uint256 expiresAt;        // When consent expires (0 = never)
        uint256 revokedAt;        // When revoked (0 = not revoked)
        bytes32 purposeHash;      // Hash of consent purpose
        bool exists;              // Record exists
    }

    // Storage
    mapping(bytes32 => ConsentRecord) public consents;           // consentId => ConsentRecord
    mapping(bytes32 => bytes32[]) public patientConsents;        // patientId => consentIds[]
    mapping(bytes32 => bytes32[]) public granteeConsents;        // granteeId => consentIds[]
    mapping(bytes32 => mapping(bytes32 => bytes32[])) public patientGranteeConsents; // patientId => granteeId => consentIds[]
    
    bytes32[] public allConsents;
    uint256 public totalConsents;

    // Events
    event ConsentGranted(
        bytes32 indexed consentId,
        bytes32 indexed patientId,
        bytes32 indexed granteeId,
        ConsentType consentType,
        uint256 expiresAt,
        uint256 timestamp
    );

    event ConsentRevoked(
        bytes32 indexed consentId,
        bytes32 indexed patientId,
        bytes32 indexed granteeId,
        uint256 timestamp
    );

    event ConsentExpired(
        bytes32 indexed consentId,
        bytes32 indexed patientId,
        bytes32 indexed granteeId,
        uint256 timestamp
    );

    // Modifiers
    modifier consentExists(bytes32 consentId) {
        require(consents[consentId].exists, "Consent not found");
        _;
    }

    // Constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CONSENT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Grant consent from patient to provider
     * @param patientId Hashed patient ID
     * @param granteeId Hashed provider ID
     * @param consentType Type of consent being granted
     * @param expiresAt Expiration timestamp (0 for no expiry)
     * @param purposeHash Hash of consent purpose/reason
     * @return consentId Unique consent record ID
     */
    function grantConsent(
        bytes32 patientId,
        bytes32 granteeId,
        ConsentType consentType,
        uint256 expiresAt,
        bytes32 purposeHash
    ) external onlyRole(CONSENT_ADMIN_ROLE) nonReentrant returns (bytes32 consentId) {
        require(patientId != bytes32(0), "Patient ID required");
        require(granteeId != bytes32(0), "Grantee ID required");
        require(expiresAt == 0 || expiresAt > block.timestamp, "Invalid expiry");

        // Generate unique consent ID
        consentId = keccak256(abi.encodePacked(
            patientId,
            granteeId,
            consentType,
            block.timestamp,
            totalConsents
        ));

        require(!consents[consentId].exists, "Consent already exists");

        // Create consent record
        consents[consentId] = ConsentRecord({
            patientId: patientId,
            granteeId: granteeId,
            consentType: consentType,
            status: ConsentStatus.GRANTED,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            revokedAt: 0,
            purposeHash: purposeHash,
            exists: true
        });

        // Update tracking
        allConsents.push(consentId);
        patientConsents[patientId].push(consentId);
        granteeConsents[granteeId].push(consentId);
        patientGranteeConsents[patientId][granteeId].push(consentId);
        totalConsents++;

        emit ConsentGranted(
            consentId,
            patientId,
            granteeId,
            consentType,
            expiresAt,
            block.timestamp
        );

        return consentId;
    }

    /**
     * @notice Revoke an existing consent
     * @param consentId The consent to revoke
     */
    function revokeConsent(bytes32 consentId) 
        external 
        onlyRole(CONSENT_ADMIN_ROLE) 
        consentExists(consentId) 
        nonReentrant 
    {
        ConsentRecord storage consent = consents[consentId];
        require(consent.status == ConsentStatus.GRANTED, "Consent not active");

        consent.status = ConsentStatus.REVOKED;
        consent.revokedAt = block.timestamp;

        emit ConsentRevoked(
            consentId,
            consent.patientId,
            consent.granteeId,
            block.timestamp
        );
    }

    /**
     * @notice Check if consent is currently valid
     * @param consentId The consent ID to check
     * @return isValid True if consent is valid
     * @return consentType The type of consent
     */
    function isConsentValid(bytes32 consentId) 
        external 
        view 
        consentExists(consentId) 
        returns (bool isValid, ConsentType consentType) 
    {
        ConsentRecord memory consent = consents[consentId];
        
        bool active = consent.status == ConsentStatus.GRANTED;
        bool notExpired = consent.expiresAt == 0 || consent.expiresAt > block.timestamp;
        
        return (active && notExpired, consent.consentType);
    }

    /**
     * @notice Check if provider has valid consent for patient
     * @param patientId Hashed patient ID
     * @param granteeId Hashed provider ID
     * @param requiredType Required consent type
     * @return hasConsent True if valid consent exists
     * @return consentId The valid consent ID (if any)
     */
    function checkConsent(
        bytes32 patientId,
        bytes32 granteeId,
        ConsentType requiredType
    ) external view returns (bool hasConsent, bytes32 consentId) {
        bytes32[] memory consentIds = patientGranteeConsents[patientId][granteeId];
        
        for (uint256 i = 0; i < consentIds.length; i++) {
            ConsentRecord memory consent = consents[consentIds[i]];
            
            if (consent.status == ConsentStatus.GRANTED &&
                consent.consentType == requiredType &&
                (consent.expiresAt == 0 || consent.expiresAt > block.timestamp)) {
                return (true, consentIds[i]);
            }
            
            // FULL_ACCESS covers all other types
            if (consent.status == ConsentStatus.GRANTED &&
                consent.consentType == ConsentType.FULL_ACCESS &&
                (consent.expiresAt == 0 || consent.expiresAt > block.timestamp)) {
                return (true, consentIds[i]);
            }
        }
        
        return (false, bytes32(0));
    }

    /**
     * @notice Get consent record details
     * @param consentId The consent ID
     */
    function getConsent(bytes32 consentId) 
        external 
        view 
        consentExists(consentId)
        returns (
            bytes32 patientId,
            bytes32 granteeId,
            ConsentType consentType,
            ConsentStatus status,
            uint256 grantedAt,
            uint256 expiresAt,
            uint256 revokedAt,
            bytes32 purposeHash
        )
    {
        ConsentRecord memory consent = consents[consentId];
        return (
            consent.patientId,
            consent.granteeId,
            consent.consentType,
            consent.status,
            consent.grantedAt,
            consent.expiresAt,
            consent.revokedAt,
            consent.purposeHash
        );
    }

    /**
     * @notice Get all consents for a patient
     * @param patientId Hashed patient ID
     */
    function getPatientConsents(bytes32 patientId) external view returns (bytes32[] memory) {
        return patientConsents[patientId];
    }

    /**
     * @notice Get all consents granted to a provider
     * @param granteeId Hashed provider ID
     */
    function getGranteeConsents(bytes32 granteeId) external view returns (bytes32[] memory) {
        return granteeConsents[granteeId];
    }

    /**
     * @notice Batch check for expired consents and mark them
     * @param consentIds Array of consent IDs to check
     * @return expiredCount Number of consents marked as expired
     */
    function markExpiredConsents(bytes32[] calldata consentIds) 
        external 
        onlyRole(CONSENT_ADMIN_ROLE) 
        returns (uint256 expiredCount) 
    {
        for (uint256 i = 0; i < consentIds.length; i++) {
            ConsentRecord storage consent = consents[consentIds[i]];
            
            if (consent.exists && 
                consent.status == ConsentStatus.GRANTED &&
                consent.expiresAt != 0 &&
                consent.expiresAt <= block.timestamp) {
                
                consent.status = ConsentStatus.EXPIRED;
                expiredCount++;
                
                emit ConsentExpired(
                    consentIds[i],
                    consent.patientId,
                    consent.granteeId,
                    block.timestamp
                );
            }
        }
        return expiredCount;
    }

    /**
     * @notice Grant healthcare provider role
     */
    function grantProviderRole(address account) external onlyRole(CONSENT_ADMIN_ROLE) {
        grantRole(HEALTHCARE_PROVIDER_ROLE, account);
    }

    /**
     * @notice Revoke healthcare provider role
     */
    function revokeProviderRole(address account) external onlyRole(CONSENT_ADMIN_ROLE) {
        revokeRole(HEALTHCARE_PROVIDER_ROLE, account);
    }

    /**
     * @notice Get total number of consents
     */
    function getTotalConsents() external view returns (uint256) {
        return totalConsents;
    }
}
