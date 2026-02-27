// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RecordRegistry {
    struct Record {
        bytes32 recordHash;
        uint256 timestamp;
        address uploadedBy;
        string recordType;
    }

    // Mapping: Patient Address => List of Records
    mapping(address => Record[]) public patientRecords;

    event RecordAnchored(address indexed patient, bytes32 indexed recordHash, address indexed uploader);

    function anchorRecord(address patient, bytes32 _recordHash, string memory _recordType) public {
        require(patient != address(0), "Invalid patient address");
        
        Record memory newRecord = Record({
            recordHash: _recordHash,
            timestamp: block.timestamp,
            uploadedBy: msg.sender,
            recordType: _recordType
        });

        patientRecords[patient].push(newRecord);
        emit RecordAnchored(patient, _recordHash, msg.sender);
    }

    function getPatientRecordsCount(address patient) public view returns (uint256) {
        return patientRecords[patient].length;
    }

    function getPatientRecord(address patient, uint256 index) public view returns (bytes32, uint256, address, string memory) {
        require(index < patientRecords[patient].length, "Index out of bounds");
        Record memory record = patientRecords[patient][index];
        return (record.recordHash, record.timestamp, record.uploadedBy, record.recordType);
    }
}
