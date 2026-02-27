// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PrescriptionRegistry
 * @notice Registry for prescription authenticity verification
 * @dev Stores ONLY hashes of prescriptions for verification
 * 
 * Use Case:
 * - Doctor creates prescription in DB
 * - System hashes prescription data
 * - Hash is stored on-chain
 * - Pharmacy verifies prescription by comparing hashes
 */
contract PrescriptionRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant PRESCRIBER_ROLE = keccak256("PRESCRIBER_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");
    bytes32 public constant REGISTRY_ADMIN_ROLE = keccak256("REGISTRY_ADMIN_ROLE");

    // Prescription status
    enum PrescriptionStatus {
        ACTIVE,
        FILLED,
        PARTIALLY_FILLED,
        CANCELLED,
        EXPIRED
    }

    // Struct for prescription record
    struct PrescriptionRecord {
        bytes32 prescriptionHash;   // Hash of prescription data
        bytes32 patientId;          // Hashed patient ID
        bytes32 prescriberId;       // Hashed doctor ID
        bytes32 pharmacyId;         // Hashed pharmacy ID (when filled)
        PrescriptionStatus status;  // Current status
        uint256 createdAt;          // Creation timestamp
        uint256 validUntil;         // Expiration timestamp
        uint256 filledAt;           // When filled (0 if not filled)
        uint8 refillsAllowed;       // Number of refills allowed
        uint8 refillsUsed;          // Number of refills used
        bool exists;                // Record exists
    }

    // Storage
    mapping(bytes32 => PrescriptionRecord) public prescriptions;      // prescriptionId => PrescriptionRecord
    mapping(bytes32 => bytes32[]) public patientPrescriptions;        // patientId => prescriptionIds[]
    mapping(bytes32 => bytes32[]) public prescriberPrescriptions;     // prescriberId => prescriptionIds[]
    mapping(bytes32 => bytes32[]) public pharmacyFills;               // pharmacyId => prescriptionIds[]
    
    bytes32[] public allPrescriptions;
    uint256 public totalPrescriptions;
    uint256 public totalFilled;

    // Events
    event PrescriptionCreated(
        bytes32 indexed prescriptionId,
        bytes32 indexed patientId,
        bytes32 indexed prescriberId,
        bytes32 prescriptionHash,
        uint256 validUntil,
        uint256 timestamp
    );

    event PrescriptionFilled(
        bytes32 indexed prescriptionId,
        bytes32 indexed pharmacyId,
        uint256 timestamp
    );

    event PrescriptionRefilled(
        bytes32 indexed prescriptionId,
        bytes32 indexed pharmacyId,
        uint8 refillNumber,
        uint256 timestamp
    );

    event PrescriptionCancelled(
        bytes32 indexed prescriptionId,
        uint256 timestamp
    );

    event PrescriptionVerified(
        bytes32 indexed prescriptionId,
        bool isValid,
        address verifier,
        uint256 timestamp
    );

    // Modifiers
    modifier prescriptionExists(bytes32 prescriptionId) {
        require(prescriptions[prescriptionId].exists, "Prescription not found");
        _;
    }

    // Constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRY_ADMIN_ROLE, msg.sender);
        _grantRole(PRESCRIBER_ROLE, msg.sender);
    }

    /**
     * @notice Register a new prescription
     * @param prescriptionId Unique prescription ID (from off-chain DB)
     * @param prescriptionHash SHA256 hash of prescription data
     * @param patientId Hashed patient ID
     * @param prescriberId Hashed doctor ID
     * @param validUntil Prescription expiration timestamp
     * @param refillsAllowed Number of refills allowed
     */
    function createPrescription(
        bytes32 prescriptionId,
        bytes32 prescriptionHash,
        bytes32 patientId,
        bytes32 prescriberId,
        uint256 validUntil,
        uint8 refillsAllowed
    ) external onlyRole(PRESCRIBER_ROLE) nonReentrant {
        require(prescriptionId != bytes32(0), "Invalid prescription ID");
        require(prescriptionHash != bytes32(0), "Prescription hash required");
        require(patientId != bytes32(0), "Patient ID required");
        require(!prescriptions[prescriptionId].exists, "Prescription already exists");
        require(validUntil > block.timestamp, "Invalid validity period");

        prescriptions[prescriptionId] = PrescriptionRecord({
            prescriptionHash: prescriptionHash,
            patientId: patientId,
            prescriberId: prescriberId,
            pharmacyId: bytes32(0),
            status: PrescriptionStatus.ACTIVE,
            createdAt: block.timestamp,
            validUntil: validUntil,
            filledAt: 0,
            refillsAllowed: refillsAllowed,
            refillsUsed: 0,
            exists: true
        });

        allPrescriptions.push(prescriptionId);
        patientPrescriptions[patientId].push(prescriptionId);
        prescriberPrescriptions[prescriberId].push(prescriptionId);
        totalPrescriptions++;

        emit PrescriptionCreated(
            prescriptionId,
            patientId,
            prescriberId,
            prescriptionHash,
            validUntil,
            block.timestamp
        );
    }

    /**
     * @notice Mark prescription as filled by pharmacy
     * @param prescriptionId The prescription to fill
     * @param pharmacyId Hashed pharmacy ID
     * @param currentHash Current hash of prescription to verify integrity
     */
    function fillPrescription(
        bytes32 prescriptionId,
        bytes32 pharmacyId,
        bytes32 currentHash
    ) external onlyRole(PHARMACY_ROLE) prescriptionExists(prescriptionId) nonReentrant {
        PrescriptionRecord storage prescription = prescriptions[prescriptionId];
        
        require(prescription.status == PrescriptionStatus.ACTIVE, "Prescription not active");
        require(prescription.validUntil > block.timestamp, "Prescription expired");
        require(prescription.prescriptionHash == currentHash, "Hash mismatch - prescription may be tampered");
        require(pharmacyId != bytes32(0), "Pharmacy ID required");

        prescription.status = PrescriptionStatus.FILLED;
        prescription.pharmacyId = pharmacyId;
        prescription.filledAt = block.timestamp;
        totalFilled++;

        pharmacyFills[pharmacyId].push(prescriptionId);

        emit PrescriptionFilled(prescriptionId, pharmacyId, block.timestamp);
    }

    /**
     * @notice Process a refill for a prescription
     * @param prescriptionId The prescription to refill
     * @param pharmacyId Hashed pharmacy ID
     */
    function refillPrescription(
        bytes32 prescriptionId,
        bytes32 pharmacyId
    ) external onlyRole(PHARMACY_ROLE) prescriptionExists(prescriptionId) nonReentrant {
        PrescriptionRecord storage prescription = prescriptions[prescriptionId];
        
        require(
            prescription.status == PrescriptionStatus.FILLED || 
            prescription.status == PrescriptionStatus.PARTIALLY_FILLED,
            "Prescription must be filled first"
        );
        require(prescription.validUntil > block.timestamp, "Prescription expired");
        require(prescription.refillsUsed < prescription.refillsAllowed, "No refills remaining");

        prescription.refillsUsed++;
        
        if (prescription.refillsUsed == prescription.refillsAllowed) {
            // All refills used, but prescription is complete
            prescription.status = PrescriptionStatus.FILLED;
        } else {
            prescription.status = PrescriptionStatus.PARTIALLY_FILLED;
        }

        emit PrescriptionRefilled(
            prescriptionId,
            pharmacyId,
            prescription.refillsUsed,
            block.timestamp
        );
    }

    /**
     * @notice Cancel a prescription
     * @param prescriptionId The prescription to cancel
     */
    function cancelPrescription(bytes32 prescriptionId) 
        external 
        onlyRole(PRESCRIBER_ROLE) 
        prescriptionExists(prescriptionId) 
        nonReentrant 
    {
        PrescriptionRecord storage prescription = prescriptions[prescriptionId];
        require(prescription.status == PrescriptionStatus.ACTIVE, "Can only cancel active prescriptions");

        prescription.status = PrescriptionStatus.CANCELLED;

        emit PrescriptionCancelled(prescriptionId, block.timestamp);
    }

    /**
     * @notice Verify prescription authenticity
     * @param prescriptionId The prescription ID to verify
     * @param currentHash Current hash of prescription data
     * @return isValid True if prescription is valid and not tampered
     * @return status Current prescription status
     * @return originalHash Original hash stored on-chain
     */
    function verifyPrescription(
        bytes32 prescriptionId,
        bytes32 currentHash
    ) external prescriptionExists(prescriptionId) returns (
        bool isValid,
        PrescriptionStatus status,
        bytes32 originalHash
    ) {
        PrescriptionRecord memory prescription = prescriptions[prescriptionId];
        
        bool hashMatch = prescription.prescriptionHash == currentHash;
        bool notExpired = prescription.validUntil > block.timestamp;
        bool validStatus = prescription.status == PrescriptionStatus.ACTIVE ||
                          prescription.status == PrescriptionStatus.PARTIALLY_FILLED;
        
        isValid = hashMatch && notExpired && validStatus;

        emit PrescriptionVerified(prescriptionId, isValid, msg.sender, block.timestamp);

        return (isValid, prescription.status, prescription.prescriptionHash);
    }

    /**
     * @notice View-only prescription verification (no event)
     */
    function verifyPrescriptionView(
        bytes32 prescriptionId,
        bytes32 currentHash
    ) external view prescriptionExists(prescriptionId) returns (
        bool isValid,
        PrescriptionStatus status,
        bytes32 originalHash,
        uint256 validUntil
    ) {
        PrescriptionRecord memory prescription = prescriptions[prescriptionId];
        
        bool hashMatch = prescription.prescriptionHash == currentHash;
        bool notExpired = prescription.validUntil > block.timestamp;
        bool validStatus = prescription.status == PrescriptionStatus.ACTIVE ||
                          prescription.status == PrescriptionStatus.PARTIALLY_FILLED;
        
        return (
            hashMatch && notExpired && validStatus,
            prescription.status,
            prescription.prescriptionHash,
            prescription.validUntil
        );
    }

    /**
     * @notice Get prescription details
     */
    function getPrescription(bytes32 prescriptionId) 
        external 
        view 
        prescriptionExists(prescriptionId)
        returns (
            bytes32 prescriptionHash,
            bytes32 patientId,
            bytes32 prescriberId,
            bytes32 pharmacyId,
            PrescriptionStatus status,
            uint256 createdAt,
            uint256 validUntil,
            uint256 filledAt,
            uint8 refillsAllowed,
            uint8 refillsUsed
        )
    {
        PrescriptionRecord memory p = prescriptions[prescriptionId];
        return (
            p.prescriptionHash,
            p.patientId,
            p.prescriberId,
            p.pharmacyId,
            p.status,
            p.createdAt,
            p.validUntil,
            p.filledAt,
            p.refillsAllowed,
            p.refillsUsed
        );
    }

    /**
     * @notice Get patient's prescriptions
     */
    function getPatientPrescriptions(bytes32 patientId) external view returns (bytes32[] memory) {
        return patientPrescriptions[patientId];
    }

    /**
     * @notice Get prescriber's prescriptions
     */
    function getPrescriberPrescriptions(bytes32 prescriberId) external view returns (bytes32[] memory) {
        return prescriberPrescriptions[prescriberId];
    }

    /**
     * @notice Get pharmacy's filled prescriptions
     */
    function getPharmacyFills(bytes32 pharmacyId) external view returns (bytes32[] memory) {
        return pharmacyFills[pharmacyId];
    }

    /**
     * @notice Check remaining refills
     */
    function getRemainingRefills(bytes32 prescriptionId) 
        external 
        view 
        prescriptionExists(prescriptionId) 
        returns (uint8) 
    {
        PrescriptionRecord memory p = prescriptions[prescriptionId];
        return p.refillsAllowed - p.refillsUsed;
    }

    /**
     * @notice Grant prescriber role (for doctors)
     */
    function grantPrescriberRole(address account) external onlyRole(REGISTRY_ADMIN_ROLE) {
        grantRole(PRESCRIBER_ROLE, account);
    }

    /**
     * @notice Grant pharmacy role
     */
    function grantPharmacyRole(address account) external onlyRole(REGISTRY_ADMIN_ROLE) {
        grantRole(PHARMACY_ROLE, account);
    }

    /**
     * @notice Get statistics
     */
    function getStats() external view returns (
        uint256 total,
        uint256 filled
    ) {
        return (totalPrescriptions, totalFilled);
    }
}
