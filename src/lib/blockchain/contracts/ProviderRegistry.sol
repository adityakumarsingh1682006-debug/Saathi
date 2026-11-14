// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title ProviderRegistry
 * @notice Maintains accreditation status and cryptographic identity for healthcare providers.
 * @dev Governed by healthcare regulatory authorities (e.g., NABH, NMC, State Medical Councils).
 *      Strictly zero Protected Health Information (PHI) stored on-chain.
 */
contract ProviderRegistry is Ownable2Step {
    enum ProviderStatus {
        Inactive,
        PendingVerification,
        Accredited,
        Suspended,
        Revoked
    }

    struct ProviderInfo {
        address walletAddress;
        string licenseNumber;
        string organizationName;
        string jurisdiction;
        ProviderStatus status;
        uint256 accreditedAt;
        uint256 validUntil;
        bytes32 metadataHash; // IPFS CID / cryptographic digest of verifiable credentials (zero PII)
    }

    mapping(address => ProviderInfo) private providers;
    mapping(string => address) private licenseToAddress;

    event ProviderRegistered(address indexed provider, string licenseNumber, string organizationName);
    event ProviderAccredited(address indexed provider, uint256 validUntil);
    event ProviderSuspended(address indexed provider, string reason);
    event ProviderReactivated(address indexed provider);
    event ProviderRevoked(address indexed provider, string reason);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Providers submit self-sovereign accreditation registration requests
     */
    function registerProvider(
        string calldata licenseNumber,
        string calldata organizationName,
        string calldata jurisdiction,
        bytes32 metadataHash
    ) external {
        require(bytes(licenseNumber).length > 0, "ProviderRegistry: empty license");
        require(bytes(organizationName).length > 0, "ProviderRegistry: empty organization");
        require(providers[msg.sender].status == ProviderStatus.Inactive, "ProviderRegistry: already registered");
        require(licenseToAddress[licenseNumber] == address(0), "ProviderRegistry: license in use");

        providers[msg.sender] = ProviderInfo({
            walletAddress: msg.sender,
            licenseNumber: licenseNumber,
            organizationName: organizationName,
            jurisdiction: jurisdiction,
            status: ProviderStatus.PendingVerification,
            accreditedAt: 0,
            validUntil: 0,
            metadataHash: metadataHash
        });
        licenseToAddress[licenseNumber] = msg.sender;

        emit ProviderRegistered(msg.sender, licenseNumber, organizationName);
    }

    /**
     * @notice Regulator accredits a registered provider with validity duration
     */
    function accreditProvider(address providerAddress, uint256 validityDuration) external onlyOwner {
        require(providerAddress != address(0), "ProviderRegistry: invalid address");
        require(validityDuration > 0, "ProviderRegistry: duration must be > 0");
        ProviderInfo storage p = providers[providerAddress];
        require(p.status != ProviderStatus.Inactive, "ProviderRegistry: provider not found");
        require(p.status != ProviderStatus.Revoked, "ProviderRegistry: provider permanently revoked");

        p.status = ProviderStatus.Accredited;
        p.accreditedAt = block.timestamp;
        p.validUntil = block.timestamp + validityDuration;

        emit ProviderAccredited(providerAddress, p.validUntil);
    }

    /**
     * @notice Regulator temporarily suspends an accredited provider
     */
    function suspendProvider(address providerAddress, string calldata reason) external onlyOwner {
        require(providerAddress != address(0), "ProviderRegistry: invalid address");
        ProviderInfo storage p = providers[providerAddress];
        require(p.status == ProviderStatus.Accredited, "ProviderRegistry: provider not accredited");

        p.status = ProviderStatus.Suspended;
        emit ProviderSuspended(providerAddress, reason);
    }

    /**
     * @notice Regulator reactivates a suspended provider
     */
    function reactivateProvider(address providerAddress) external onlyOwner {
        require(providerAddress != address(0), "ProviderRegistry: invalid address");
        ProviderInfo storage p = providers[providerAddress];
        require(p.status == ProviderStatus.Suspended, "ProviderRegistry: provider not suspended");
        require(block.timestamp <= p.validUntil, "ProviderRegistry: accreditation expired");

        p.status = ProviderStatus.Accredited;
        emit ProviderReactivated(providerAddress);
    }

    /**
     * @notice Regulator permanently revokes an accredited or suspended provider
     */
    function revokeProvider(address providerAddress, string calldata reason) external onlyOwner {
        require(providerAddress != address(0), "ProviderRegistry: invalid address");
        ProviderInfo storage p = providers[providerAddress];
        require(p.status != ProviderStatus.Inactive, "ProviderRegistry: provider not found");

        p.status = ProviderStatus.Revoked;
        p.validUntil = block.timestamp;
        emit ProviderRevoked(providerAddress, reason);
    }

    /**
     * @notice Checks whether a healthcare provider is currently accredited and unexpired
     */
    function isProviderAccredited(address providerAddress) external view returns (bool) {
        ProviderInfo storage p = providers[providerAddress];
        return (p.status == ProviderStatus.Accredited && block.timestamp <= p.validUntil);
    }

    /**
     * @notice Retrieve provider details
     */
    function getProvider(address providerAddress) external view returns (ProviderInfo memory) {
        return providers[providerAddress];
    }
}
