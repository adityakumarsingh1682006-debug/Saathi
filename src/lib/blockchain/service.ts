import { ethers } from "ethers";
import { CONSENT_REGISTRY_ABI, PROVIDER_REGISTRY_ABI, CREDENTIAL_STATUS_REGISTRY_ABI } from "./abis";
import { ConsentRecord, VerifiableCredential } from "./types";

export interface BlockchainConfig {
  consentRegistryAddress?: string;
  providerRegistryAddress?: string;
  credentialRegistryAddress?: string;
  isLiveDeployment: boolean;
}

export function getBlockchainConfig(): BlockchainConfig {
  const consent = process.env.NEXT_PUBLIC_CONSENT_REGISTRY_ADDRESS;
  const provider = process.env.NEXT_PUBLIC_PROVIDER_REGISTRY_ADDRESS;
  const credential =
    process.env.NEXT_PUBLIC_CREDENTIAL_STATUS_REGISTRY_ADDRESS ||
    process.env.NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS;

  const isLiveDeployment = Boolean(
    consent && consent.startsWith("0x") && consent.length === 42 &&
    provider && provider.startsWith("0x") && provider.length === 42
  );

  return {
    consentRegistryAddress: consent,
    providerRegistryAddress: provider,
    credentialRegistryAddress: credential,
    isLiveDeployment,
  };
}

export async function grantConsentOnChain(
  signer: ethers.Signer,
  providerAddress: string,
  scopeMask: string,
  durationHours: number,
  policyHash: string
): Promise<{ txHash?: string; isSimulated: boolean; error?: string }> {
  const config = getBlockchainConfig();

  if (!config.isLiveDeployment || !config.consentRegistryAddress) {
    // Contract is not deployed to network. We do NOT fake a transaction hash.
    // Return explicit simulated development state.
    return {
      isSimulated: true,
    };
  }

  try {
    const contract = new ethers.Contract(config.consentRegistryAddress, CONSENT_REGISTRY_ABI, signer);
    const durationSeconds = durationHours * 3600;
    const tx = await contract.grantConsent(providerAddress, scopeMask, durationSeconds, policyHash);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      isSimulated: false,
    };
  } catch (err: any) {
    return {
      isSimulated: false,
      error: err?.message || "Transaction failed on Sepolia network",
    };
  }
}

export async function revokeConsentOnChain(
  signer: ethers.Signer,
  providerAddress: string
): Promise<{ txHash?: string; isSimulated: boolean; error?: string }> {
  const config = getBlockchainConfig();

  if (!config.isLiveDeployment || !config.consentRegistryAddress) {
    return { isSimulated: true };
  }

  try {
    const contract = new ethers.Contract(config.consentRegistryAddress, CONSENT_REGISTRY_ABI, signer);
    const tx = await contract.revokeConsent(providerAddress);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      isSimulated: false,
    };
  } catch (err: any) {
    return {
      isSimulated: false,
      error: err?.message || "Revocation failed on Sepolia network",
    };
  }
}

export async function verifyCredentialOnChain(
  credentialHash: string,
  provider?: ethers.Provider
): Promise<{
  state: "Valid" | "Revoked" | "Suspended" | "Unanchored";
  issuer?: string;
  isSimulated: boolean;
}> {
  const config = getBlockchainConfig();

  if (!config.isLiveDeployment || !config.credentialRegistryAddress || !provider) {
    return {
      state: "Valid",
      isSimulated: true,
    };
  }

  try {
    const contract = new ethers.Contract(
      config.credentialRegistryAddress,
      CREDENTIAL_STATUS_REGISTRY_ABI,
      provider
    );
    const [stateNum, issuer] = await contract.checkCredentialStatus(credentialHash);
    const stateMap: Record<number, "Valid" | "Revoked" | "Suspended" | "Unanchored"> = {
      0: "Unanchored",
      1: "Valid",
      2: "Revoked",
      3: "Suspended",
    };
    return {
      state: stateMap[Number(stateNum)] || "Unanchored",
      issuer,
      isSimulated: false,
    };
  } catch (err) {
    return {
      state: "Unanchored",
      isSimulated: true,
    };
  }
}
