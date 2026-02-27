// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthcareAudit {
    struct LogEntry {
        uint256 timestamp;
        address actor;
        string action; // e.g., "DOC_APPROVED", "REPT_UPLOAD", "RX_CREATED"
        string details; // Off-chain reference ID or summary
    }

    LogEntry[] public auditTrail;
    address public admin;

    event ActionLogged(uint256 timestamp, address indexed actor, string action);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    function logAction(address _actor, string memory _action, string memory _details) public {
        // In a real scenario, this might be restricted to certain authorized backend accounts
        auditTrail.push(LogEntry({
            timestamp: block.timestamp,
            actor: _actor,
            action: _action,
            details: _details
        }));
        emit ActionLogged(block.timestamp, _actor, _action);
    }

    function getAuditTrailCount() public view returns (uint256) {
        return auditTrail.length;
    }
}
