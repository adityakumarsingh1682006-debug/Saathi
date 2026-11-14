import { ethers } from "ethers";

export const SAATHI_EIP712_DOMAIN = {
  name: "SAATHI Consent Gateway",
  version: "1.0",
  chainId: 11155111, // Ethereum Sepolia
  verifyingContract: "0x0000000000000000000000000000000000000000", // Will use deployed address if configured
};

export const CONSENT_PERMIT_TYPES = {
  ConsentPermit: [
    { name: "patient", type: "address" },
    { name: "provider", type: "address" },
    { name: "scopeMask", type: "bytes32" },
    { name: "validFrom", type: "uint256" },
    { name: "validUntil", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "policyHash", type: "bytes32" },
  ],
};

export interface ConsentPermitMessage {
  patient: string;
  provider: string;
  scopeMask: string;
  validFrom: number;
  validUntil: number;
  nonce: number;
  policyHash: string;
}

export function computePolicyHash(policy: {
  scopes: string[];
  purpose: string;
  timestamp: number;
  termsVersion: string;
}): string {
  const serialized = JSON.stringify(policy);
  return ethers.keccak256(ethers.toUtf8Bytes(serialized));
}

export async function signConsentPermit(
  signer: ethers.Signer,
  message: ConsentPermitMessage,
  contractAddress?: string
): Promise<string> {
  const domain = {
    ...SAATHI_EIP712_DOMAIN,
    verifyingContract: contractAddress || "0x0000000000000000000000000000000000000000",
  };

  return await signer.signTypedData(domain, CONSENT_PERMIT_TYPES, message);
}
