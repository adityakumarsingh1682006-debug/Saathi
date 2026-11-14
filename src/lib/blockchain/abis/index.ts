export const PROVIDER_REGISTRY_ABI = [
  "function registerProvider(string licenseNumber, string organizationName, string jurisdiction, bytes32 metadataHash) external",
  "function accreditProvider(address providerAddress, uint256 validityDuration) external",
  "function suspendProvider(address providerAddress, string reason) external",
  "function reactivateProvider(address providerAddress) external",
  "function revokeProvider(address providerAddress, string reason) external",
  "function isProviderAccredited(address providerAddress) external view returns (bool)",
  "function getProvider(address providerAddress) external view returns (tuple(address walletAddress, string licenseNumber, string organizationName, string jurisdiction, uint8 status, uint256 accreditedAt, uint256 validUntil, bytes32 metadataHash))",
  "event ProviderRegistered(address indexed provider, string licenseNumber, string organizationName)",
  "event ProviderAccredited(address indexed provider, uint256 validUntil)",
  "event ProviderSuspended(address indexed provider, string reason)",
  "event ProviderReactivated(address indexed provider)",
  "event ProviderRevoked(address indexed provider, string reason)"
];

export const CONSENT_REGISTRY_ABI = [
  "function grantConsent(address provider, bytes32 scopeMask, uint256 validityDuration, bytes32 policyHash) external",
  "function grantConsentWithPermit(address patient, address provider, bytes32 scopeMask, uint256 validFrom, uint256 validUntil, bytes32 policyHash, uint8 v, bytes32 r, bytes32 s) external",
  "function revokeConsent(address provider) external",
  "function hasValidConsent(address patient, address provider, bytes32 requiredScope) external view returns (bool)",
  "function requestEmergencyAccess(address patient, bytes32 reasonHash, bytes32 breakGlassScope, uint256 emergencyDuration) external",
  "function nonces(address patient) external view returns (uint256)",
  "function consents(address patient, address provider) external view returns (tuple(address patient, address provider, bytes32 scopeMask, uint256 validFrom, uint256 validUntil, bool isActive, uint256 nonce, bytes32 policyHash))",
  "event ConsentGranted(address indexed patient, address indexed provider, bytes32 scopeMask, uint256 validFrom, uint256 validUntil, bytes32 policyHash)",
  "event ConsentRevoked(address indexed patient, address indexed provider, uint256 timestamp)",
  "event EmergencyBreakGlass(address indexed patient, address indexed provider, bytes32 reasonHash, uint256 validUntil)"
];

export const CREDENTIAL_STATUS_REGISTRY_ABI = [
  "function anchorCredential(bytes32 credentialHash, uint256 validityDuration) external",
  "function revokeCredential(bytes32 credentialHash, bytes32 reasonHash) external",
  "function checkCredentialStatus(bytes32 credentialHash) external view returns (uint8 state, address issuer, uint256 issuedAt, uint256 validUntil)",
  "event CredentialAnchored(bytes32 indexed credentialHash, address indexed issuer, uint256 validUntil)",
  "event CredentialRevoked(bytes32 indexed credentialHash, address indexed issuer, bytes32 reasonHash)"
];
