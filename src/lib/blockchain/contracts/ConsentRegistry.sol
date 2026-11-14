// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IProviderRegistry {
    function isProviderAccredited(address providerAddress) external view returns (bool);
}

/**
 * @title ConsentRegistry
 * @notice Enforces patient-controlled cryptographic consent for medical record access.
 * @dev Enforces scopes, duration, provider accreditation, and EIP-712 structured permits.
 *      Strictly zero personal health information is stored on-chain.
 */
contract ConsentRegistry is EIP712 {
    using ECDSA for bytes32;

    struct ConsentRecord {
        address patient;
        address provider;
        bytes32 scopeMask;    // Bitmask or cryptographic hash representing allowed record scopes
        uint256 validFrom;
        uint256 validUntil;
        bool isActive;
        uint256 nonce;
        bytes32 policyHash;   // Hash of off-chain encrypted access control policy
    }

    struct EmergencyAccessLog {
        address patient;
        address provider;
        uint256 timestamp;
        uint256 validUntil;
        bytes32 reasonHash;
        bytes32 breakGlassScope;
    }

    IProviderRegistry public immutable providerRegistry;

    // EIP-712 consent permit typehash
    bytes32 public constant CONSENT_PERMIT_TYPEHASH = keccak256(
        "ConsentPermit(address patient,address provider,bytes32 scopeMask,uint256 validFrom,uint256 validUntil,uint256 nonce,bytes32 policyHash)"
    );

    // patient => provider => ConsentRecord
    mapping(address => mapping(address => ConsentRecord)) public consents;
    // patient => current nonce for replay protection
    mapping(address => uint256) public nonces;
    // emergency access audit trail: patient => logs
    mapping(address => EmergencyAccessLog[]) private emergencyLogs;

    event ConsentGranted(
        address indexed patient,
        address indexed provider,
        bytes32 scopeMask,
        uint256 validFrom,
        uint256 validUntil,
        bytes32 policyHash
    );

    event ConsentRevoked(
        address indexed patient,
        address indexed provider,
        uint256 timestamp
    );

    event EmergencyBreakGlass(
        address indexed patient,
        address indexed provider,
        bytes32 reasonHash,
        uint256 validUntil
    );

    constructor(address _providerRegistry) EIP712("SAATHI Consent Gateway", "1.0") {
        require(_providerRegistry != address(0), "ConsentRegistry: invalid provider registry");
        providerRegistry = IProviderRegistry(_providerRegistry);
    }

    /**
     * @notice Direct on-chain consent grant by the patient
     */
    function grantConsent(
        address provider,
        bytes32 scopeMask,
        uint256 validityDuration,
        bytes32 policyHash
    ) external {
        require(provider != address(0), "ConsentRegistry: invalid provider");
        require(scopeMask != bytes32(0), "ConsentRegistry: empty scope");
        require(validityDuration > 0, "ConsentRegistry: invalid duration");
        require(providerRegistry.isProviderAccredited(provider), "ConsentRegistry: provider not accredited");

        uint256 fromTime = block.timestamp;
        uint256 untilTime = block.timestamp + validityDuration;
        uint256 currentNonce = nonces[msg.sender]++;

        consents[msg.sender][provider] = ConsentRecord({
            patient: msg.sender,
            provider: provider,
            scopeMask: scopeMask,
            validFrom: fromTime,
            validUntil: untilTime,
            isActive: true,
            nonce: currentNonce,
            policyHash: policyHash
        });

        emit ConsentGranted(msg.sender, provider, scopeMask, fromTime, untilTime, policyHash);
    }

    /**
     * @notice Gasless / delegated consent grant using EIP-712 typed structured signatures
     * @dev Protects against replay attacks via patient nonces and timestamp expiration
     */
    function grantConsentWithPermit(
        address patient,
        address provider,
        bytes32 scopeMask,
        uint256 validFrom,
        uint256 validUntil,
        bytes32 policyHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(patient != address(0), "ConsentRegistry: invalid patient");
        require(provider != address(0), "ConsentRegistry: invalid provider");
        require(scopeMask != bytes32(0), "ConsentRegistry: empty scope");
        require(validFrom <= block.timestamp, "ConsentRegistry: permit not yet valid");
        require(validUntil > block.timestamp, "ConsentRegistry: permit expired");
        require(providerRegistry.isProviderAccredited(provider), "ConsentRegistry: provider not accredited");

        uint256 currentNonce = nonces[patient];

        // EIP-712 struct hash
        bytes32 structHash = keccak256(
            abi.encode(
                CONSENT_PERMIT_TYPEHASH,
                patient,
                provider,
                scopeMask,
                validFrom,
                validUntil,
                currentNonce,
                policyHash
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address recoveredSigner = ECDSA.recover(digest, v, r, s);
        require(recoveredSigner == patient, "ConsentRegistry: invalid signature");

        // Nonce increment prevents replay attacks
        nonces[patient] = currentNonce + 1;

        consents[patient][provider] = ConsentRecord({
            patient: patient,
            provider: provider,
            scopeMask: scopeMask,
            validFrom: validFrom,
            validUntil: validUntil,
            isActive: true,
            nonce: currentNonce,
            policyHash: policyHash
        });

        emit ConsentGranted(patient, provider, scopeMask, validFrom, validUntil, policyHash);
    }

    /**
     * @notice Patient immediately revokes consent for a provider
     */
    function revokeConsent(address provider) external {
        ConsentRecord storage c = consents[msg.sender][provider];
        require(c.isActive, "ConsentRegistry: consent not active");

        c.isActive = false;
        c.validUntil = block.timestamp;

        emit ConsentRevoked(msg.sender, provider, block.timestamp);
    }

    /**
     * @notice Verifies if a provider currently holds valid, active consent under a requested scope
     */
    function hasValidConsent(
        address patient,
        address provider,
        bytes32 requiredScope
    ) external view returns (bool) {
        ConsentRecord storage c = consents[patient][provider];
        if (!c.isActive) return false;
        if (block.timestamp > c.validUntil || block.timestamp < c.validFrom) return false;
        if (!providerRegistry.isProviderAccredited(provider)) return false;

        // Bitwise scope mask check: required scope must be fully covered
        if ((c.scopeMask & requiredScope) != requiredScope) return false;

        return true;
    }

    /**
     * @notice Emergency break-glass access triggered by an accredited provider
     */
    function requestEmergencyAccess(
        address patient,
        bytes32 reasonHash,
        bytes32 breakGlassScope,
        uint256 emergencyDuration
    ) external {
        require(patient != address(0), "ConsentRegistry: invalid patient");
        require(reasonHash != bytes32(0), "ConsentRegistry: empty reason");
        require(providerRegistry.isProviderAccredited(msg.sender), "ConsentRegistry: provider not accredited");
        require(emergencyDuration > 0 && emergencyDuration <= 4 hours, "ConsentRegistry: emergency duration 1s-4h");

        uint256 validUntil = block.timestamp + emergencyDuration;

        emergencyLogs[patient].push(EmergencyAccessLog({
            patient: patient,
            provider: msg.sender,
            timestamp: block.timestamp,
            validUntil: validUntil,
            reasonHash: reasonHash,
            breakGlassScope: breakGlassScope
        }));

        emit EmergencyBreakGlass(patient, msg.sender, reasonHash, validUntil);
    }

    /**
     * @notice Retrieve irrevocable audit trail of emergency break-glass queries
     */
    function getEmergencyAuditLogs(address patient) external view returns (EmergencyAccessLog[] memory) {
        return emergencyLogs[patient];
    }
}
