// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialStatusRegistry
 * @notice On-chain status anchor for Verifiable Credentials (W3C standard compatible).
 * @dev Stores strictly cryptographic hashes (SHA-256 digests). Zero patient health data.
 */
contract CredentialStatusRegistry {
    enum CredentialState {
        NonExistent,
        Valid,
        Revoked,
        Suspended
    }

    struct CredentialRecord {
        bytes32 credentialHash;
        address issuer;
        uint256 issuedAt;
        uint256 validUntil;
        CredentialState state;
        bytes32 revocationReasonHash;
    }

    // credentialHash => CredentialRecord
    mapping(bytes32 => CredentialRecord) private credentials;

    event CredentialAnchored(bytes32 indexed credentialHash, address indexed issuer, uint256 validUntil);
    event CredentialRevoked(bytes32 indexed credentialHash, address indexed issuer, bytes32 reasonHash);

    /**
     * @notice Accredited issuer anchors a verifiable credential cryptographic digest
     */
    function anchorCredential(bytes32 credentialHash, uint256 validityDuration) external {
        require(credentialHash != bytes32(0), "CredentialRegistry: invalid credential hash");
        require(credentials[credentialHash].state == CredentialState.NonExistent, "CredentialRegistry: already exists");

        uint256 validUntil = validityDuration == 0 ? type(uint256).max : block.timestamp + validityDuration;

        credentials[credentialHash] = CredentialRecord({
            credentialHash: credentialHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            validUntil: validUntil,
            state: CredentialState.Valid,
            revocationReasonHash: bytes32(0)
        });

        emit CredentialAnchored(credentialHash, msg.sender, validUntil);
    }

    /**
     * @notice Only the original issuing wallet can revoke its credential
     */
    function revokeCredential(bytes32 credentialHash, bytes32 reasonHash) external {
        CredentialRecord storage record = credentials[credentialHash];
        require(record.state == CredentialState.Valid || record.state == CredentialState.Suspended, "CredentialRegistry: not active");
        require(record.issuer == msg.sender, "CredentialRegistry: only issuer can revoke");

        record.state = CredentialState.Revoked;
        record.revocationReasonHash = reasonHash;

        emit CredentialRevoked(credentialHash, msg.sender, reasonHash);
    }

    /**
     * @notice Verifies credential status and dynamic validity against block timestamp
     */
    function checkCredentialStatus(bytes32 credentialHash) external view returns (
        CredentialState state,
        address issuer,
        uint256 issuedAt,
        uint256 validUntil
    ) {
        CredentialRecord storage record = credentials[credentialHash];
        if (record.state == CredentialState.Valid && block.timestamp > record.validUntil) {
            return (CredentialState.Suspended, record.issuer, record.issuedAt, record.validUntil);
        }
        return (record.state, record.issuer, record.issuedAt, record.validUntil);
    }
}
