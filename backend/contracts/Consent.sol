// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Consent {
    // Mapping: Patient Address => Provider Address => Has Consent
    mapping(address => mapping(address => bool)) public patientConsents;

    event ConsentGranted(address indexed patient, address indexed provider);
    event ConsentRevoked(address indexed patient, address indexed provider);

    function grantConsent(address provider) public {
        require(provider != address(0), "Invalid provider address");
        patientConsents[msg.sender][provider] = true;
        emit ConsentGranted(msg.sender, provider);
    }

    function revokeConsent(address provider) public {
        require(provider != address(0), "Invalid provider address");
        patientConsents[msg.sender][provider] = false;
        emit ConsentRevoked(msg.sender, provider);
    }

    function checkConsent(address patient, address provider) public view returns (bool) {
        return patientConsents[patient][provider];
    }
}
