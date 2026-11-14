import { NextResponse } from "next/server";
import { getServerSecrets, getPublicEnv } from "@/lib/env";

export async function GET() {
  const secrets = getServerSecrets();
  const publicEnv = getPublicEnv();

  const isValidAddress = (addr: string | null) =>
    Boolean(addr && addr.startsWith("0x") && addr.length === 42);

  const status = {
    gemini: {
      isConfigured: Boolean(secrets.geminiApiKey && secrets.geminiApiKey.length > 5),
      label: Boolean(secrets.geminiApiKey && secrets.geminiApiKey.length > 5) ? "Configured" : "Missing",
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      service: "Medical Report Summarizer",
    },
    supabase: {
      isConfigured: Boolean(publicEnv.supabaseUrl && !publicEnv.supabaseUrl.includes("placeholder")),
      label: Boolean(publicEnv.supabaseUrl && !publicEnv.supabaseUrl.includes("placeholder")) ? "Configured" : "Missing",
    },
    sepoliaRpc: {
      isConfigured: Boolean(secrets.sepoliaRpcUrl && secrets.sepoliaRpcUrl.length > 5),
      label: Boolean(secrets.sepoliaRpcUrl && secrets.sepoliaRpcUrl.length > 5) ? "Configured" : "Missing",
    },
    providerRegistry: {
      isDeployed: isValidAddress(publicEnv.providerRegistryAddress),
      label: isValidAddress(publicEnv.providerRegistryAddress) ? "Deployed" : "Not configured",
      address: isValidAddress(publicEnv.providerRegistryAddress) ? publicEnv.providerRegistryAddress : null,
    },
    consentRegistry: {
      isDeployed: isValidAddress(publicEnv.consentRegistryAddress),
      label: isValidAddress(publicEnv.consentRegistryAddress) ? "Deployed" : "Not configured",
      address: isValidAddress(publicEnv.consentRegistryAddress) ? publicEnv.consentRegistryAddress : null,
    },
    credentialRegistry: {
      isDeployed: isValidAddress(publicEnv.credentialRegistryAddress),
      label: isValidAddress(publicEnv.credentialRegistryAddress) ? "Deployed" : "Not configured",
      address: isValidAddress(publicEnv.credentialRegistryAddress) ? publicEnv.credentialRegistryAddress : null,
    },
    network: {
      chainId: publicEnv.chainId,
      name: publicEnv.networkName,
    },
  };

  return NextResponse.json(status);
}
