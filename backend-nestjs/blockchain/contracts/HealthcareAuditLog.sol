// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HealthcareAuditLog
 * @notice Tamper-proof audit trail for healthcare operations
 * @dev Stores ONLY hashes and metadata - NO sensitive data on-chain
 * 
 * Architecture: Hybrid Off-chain/On-chain
 * - Sensitive data: Stored in SQLite (off-chain)
 * - Integrity proofs: Stored on blockchain (on-chain)
 */
contract HealthcareAuditLog is AccessControl, ReentrancyGuard {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Enum for action types
    enum ActionType {
        PATIENT_CREATED,
        PATIENT_UPDATED,
        PRESCRIPTION_CREATED,
        PRESCRIPTION_FILLED,
        PRESCRIPTION_CANCELLED,
        APPOINTMENT_CREATED,
        APPOINTMENT_UPDATED,
        APPOINTMENT_CANCELLED,
        MEDICAL_RECORD_CREATED,
        MEDICAL_RECORD_UPDATED,
        CONSENT_GRANTED,
        CONSENT_REVOKED,
        ACCESS_GRANTED,
        ACCESS_REVOKED,
        EMERGENCY_ACCESS
    }

    // Struct for audit entry
    struct AuditEntry {
        bytes32 recordHash;      // SHA256 hash of the record
        bytes32 entityId;        // Hashed entity ID (patient, prescription, etc.)
        ActionType actionType;   // Type of action
        uint256 timestamp;       // Block timestamp
        address actor;           // Who performed the action
        bytes32 actorId;         // Hashed user ID from off-chain DB
        bytes32 previousHash;    // Link to previous entry (chain)
        bool exists;             // Entry exists flag
    }

    // Storage
    mapping(bytes32 => AuditEntry) public auditEntries;  // entryId => AuditEntry
    mapping(bytes32 => bytes32[]) public entityHistory;  // entityId => entryIds[]
    mapping(address => bytes32[]) public actorHistory;   // actor => entryIds[]
    
    bytes32[] public allEntries;     // All entry IDs for iteration
    bytes32 public lastEntryHash;    // For chaining entries
    uint256 public totalEntries;     // Counter

    // Events
    event AuditEntryCreated(
        bytes32 indexed entryId,
        bytes32 indexed entityId,
        ActionType actionType,
        address indexed actor,
        uint256 timestamp
    );

    event BatchAuditCreated(
        bytes32[] entryIds,
        uint256 count,
        uint256 timestamp
    );

    // Constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    /**
     * @notice Create a new audit entry
     * @param recordHash SHA256 hash of the full record data
     * @param entityId Hashed entity identifier
     * @param actionType Type of action performed
     * @param actorId Hashed user ID who performed the action
     * @return entryId The unique ID of the created entry
     */
    function createAuditEntry(
        bytes32 recordHash,
        bytes32 entityId,
        ActionType actionType,
        bytes32 actorId
    ) external onlyRole(AUDITOR_ROLE) nonReentrant returns (bytes32 entryId) {
        require(recordHash != bytes32(0), "Record hash required");
        require(entityId != bytes32(0), "Entity ID required");

        // Generate unique entry ID
        entryId = keccak256(abi.encodePacked(
            recordHash,
            entityId,
            actionType,
            block.timestamp,
            msg.sender,
            totalEntries
        ));

        require(!auditEntries[entryId].exists, "Entry already exists");

        // Create entry
        auditEntries[entryId] = AuditEntry({
            recordHash: recordHash,
            entityId: entityId,
            actionType: actionType,
            timestamp: block.timestamp,
            actor: msg.sender,
            actorId: actorId,
            previousHash: lastEntryHash,
            exists: true
        });

        // Update tracking
        allEntries.push(entryId);
        entityHistory[entityId].push(entryId);
        actorHistory[msg.sender].push(entryId);
        lastEntryHash = entryId;
        totalEntries++;

        emit AuditEntryCreated(entryId, entityId, actionType, msg.sender, block.timestamp);

        return entryId;
    }

    /**
     * @notice Create multiple audit entries in one transaction (gas efficient)
     * @param recordHashes Array of record hashes
     * @param entityIds Array of entity IDs
     * @param actionTypes Array of action types
     * @param actorIds Array of actor IDs
     * @return entryIds Array of created entry IDs
     */
    function createBatchAuditEntries(
        bytes32[] calldata recordHashes,
        bytes32[] calldata entityIds,
        ActionType[] calldata actionTypes,
        bytes32[] calldata actorIds
    ) external onlyRole(AUDITOR_ROLE) nonReentrant returns (bytes32[] memory entryIds) {
        uint256 length = recordHashes.length;
        require(length == entityIds.length && length == actionTypes.length && length == actorIds.length, "Array length mismatch");
        require(length <= 100, "Max 100 entries per batch");

        entryIds = new bytes32[](length);

        for (uint256 i = 0; i < length; i++) {
            bytes32 entryId = keccak256(abi.encodePacked(
                recordHashes[i],
                entityIds[i],
                actionTypes[i],
                block.timestamp,
                msg.sender,
                totalEntries + i
            ));

            auditEntries[entryId] = AuditEntry({
                recordHash: recordHashes[i],
                entityId: entityIds[i],
                actionType: actionTypes[i],
                timestamp: block.timestamp,
                actor: msg.sender,
                actorId: actorIds[i],
                previousHash: lastEntryHash,
                exists: true
            });

            allEntries.push(entryId);
            entityHistory[entityIds[i]].push(entryId);
            actorHistory[msg.sender].push(entryId);
            lastEntryHash = entryId;
            entryIds[i] = entryId;
        }

        totalEntries += length;
        emit BatchAuditCreated(entryIds, length, block.timestamp);

        return entryIds;
    }

    /**
     * @notice Verify a record's integrity by comparing hashes
     * @param entryId The audit entry ID to verify
     * @param currentRecordHash The current hash of the record
     * @return isValid True if hashes match
     * @return originalHash The original hash stored on-chain
     * @return timestamp When the record was created
     */
    function verifyRecordIntegrity(
        bytes32 entryId,
        bytes32 currentRecordHash
    ) external view returns (bool isValid, bytes32 originalHash, uint256 timestamp) {
        AuditEntry memory entry = auditEntries[entryId];
        require(entry.exists, "Entry not found");

        return (
            entry.recordHash == currentRecordHash,
            entry.recordHash,
            entry.timestamp
        );
    }

    /**
     * @notice Get audit entry details
     * @param entryId The entry ID to retrieve
     */
    function getAuditEntry(bytes32 entryId) external view returns (
        bytes32 recordHash,
        bytes32 entityId,
        ActionType actionType,
        uint256 timestamp,
        address actor,
        bytes32 actorId,
        bytes32 previousHash
    ) {
        AuditEntry memory entry = auditEntries[entryId];
        require(entry.exists, "Entry not found");

        return (
            entry.recordHash,
            entry.entityId,
            entry.actionType,
            entry.timestamp,
            entry.actor,
            entry.actorId,
            entry.previousHash
        );
    }

    /**
     * @notice Get all audit entries for an entity
     * @param entityId The hashed entity ID
     * @return entryIds Array of entry IDs
     */
    function getEntityHistory(bytes32 entityId) external view returns (bytes32[] memory) {
        return entityHistory[entityId];
    }

    /**
     * @notice Get all audit entries by an actor
     * @param actor The actor's address
     * @return entryIds Array of entry IDs
     */
    function getActorHistory(address actor) external view returns (bytes32[] memory) {
        return actorHistory[actor];
    }

    /**
     * @notice Get total number of entries
     */
    function getTotalEntries() external view returns (uint256) {
        return totalEntries;
    }

    /**
     * @notice Get entries in a range (for pagination)
     * @param start Start index
     * @param count Number of entries to retrieve
     */
    function getEntriesRange(uint256 start, uint256 count) external view returns (bytes32[] memory) {
        require(start < allEntries.length, "Start out of bounds");
        
        uint256 end = start + count;
        if (end > allEntries.length) {
            end = allEntries.length;
        }

        bytes32[] memory result = new bytes32[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = allEntries[i];
        }

        return result;
    }

    /**
     * @notice Grant auditor role to an address
     * @param account Address to grant role to
     */
    function grantAuditorRole(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(AUDITOR_ROLE, account);
    }

    /**
     * @notice Revoke auditor role from an address
     * @param account Address to revoke role from
     */
    function revokeAuditorRole(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(AUDITOR_ROLE, account);
    }
}
