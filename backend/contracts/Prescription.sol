// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PrescriptionRegistry {
    struct Prescription {
        bytes32 prescriptionHash; // Hash of the prescription data
        uint256 issueDate;
        uint256 expiryDate;
        address doctor;
        address patient;
        bool isValid;
    }

    mapping(bytes32 => Prescription) public prescriptions;

    event PrescriptionIssued(bytes32 indexed prescriptionHash, address indexed doctor, address indexed patient);
    event PrescriptionInvalidated(bytes32 indexed prescriptionHash);

    function issuePrescription(
        bytes32 _hash,
        uint256 _expiry,
        address _patient
    ) public {
        require(prescriptions[_hash].doctor == address(0), "Prescription already exists");
        
        prescriptions[_hash] = Prescription({
            prescriptionHash: _hash,
            issueDate: block.timestamp,
            expiryDate: _expiry,
            doctor: msg.sender,
            patient: _patient,
            isValid: true
        });

        emit PrescriptionIssued(_hash, msg.sender, _patient);
    }

    function verifyPrescription(bytes32 _hash) public view returns (bool) {
        Prescription memory p = prescriptions[_hash];
        return (p.isValid && p.expiryDate > block.timestamp);
    }

    function invalidatePrescription(bytes32 _hash) public {
        require(msg.sender == prescriptions[_hash].doctor, "Only the issuing doctor can invalidate");
        prescriptions[_hash].isValid = false;
        emit PrescriptionInvalidated(_hash);
    }
}
