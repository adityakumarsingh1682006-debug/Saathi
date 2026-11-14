/**
 * Environment configuration manager for SAATHI.
 * Reads environment variables safely, validates configuration status,
 * and strictly isolates server-only secrets from client exposure.
 */

export interface SystemConfigStatus {
  supabase: {
    isConfigured: boolean;
    label: "Configured" | "Missing";
    url: string | null;
  };
  sepoliaRpc: {
    isConfigured: boolean;
    label: "Configured" | "Missing";
  };
  providerRegistry: {
    isDeployed: boolean;
    label: "Deployed" | "Not configured";
    address: string | null;
  };
  consentRegistry: {
    isDeployed: boolean;
    label: "Deployed" | "Not configured";
    address: string | null;
  };
  credentialRegistry: {
    isDeployed: boolean;
    label: "Deployed" | "Not configured";
    address: string | null;
  };
  network: {
    chainId: number;
    name: string;
  };
}

export function getPublicEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "[PRESENT]" : null,
    providerRegistryAddress: process.env.NEXT_PUBLIC_PROVIDER_REGISTRY_ADDRESS || null,
    consentRegistryAddress: process.env.NEXT_PUBLIC_CONSENT_REGISTRY_ADDRESS || null,
    credentialRegistryAddress:
      process.env.NEXT_PUBLIC_CREDENTIAL_STATUS_REGISTRY_ADDRESS ||
      process.env.NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS ||
      null,
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111),
    networkName: process.env.NEXT_PUBLIC_NETWORK_NAME || "Sepolia",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };
}

/**
 * Server-only function to read sensitive keys.
 * Will throw or return empty if called in the browser.
 */
export function getServerSecrets() {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY VIOLATION: getServerSecrets cannot be called from client-side code.");
  }

  return {
    geminiApiKey: process.env.GEMINI_API_KEY || null,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
    sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL || null,
    deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY || null,
  };
}

/**
 * Computes non-sensitive status summary for UI dashboards.
 * Safe to call from client components.
 */
export function getSystemConfigStatus(): SystemConfigStatus {
  const publicEnv = getPublicEnv();

  // Check if contract addresses are valid 42-char hex addresses
  const isValidAddress = (addr: string | null) =>
    Boolean(addr && addr.startsWith("0x") && addr.length === 42);

  const hasProvider = isValidAddress(publicEnv.providerRegistryAddress);
  const hasConsent = isValidAddress(publicEnv.consentRegistryAddress);
  const hasCredential = isValidAddress(publicEnv.credentialRegistryAddress);

  // Check whether Supabase is configured
  const hasSupabase = Boolean(
    publicEnv.supabaseUrl &&
    !publicEnv.supabaseUrl.includes("placeholder") &&
    publicEnv.supabaseAnonKey
  );

  return {
    supabase: {
      isConfigured: hasSupabase,
      label: hasSupabase ? "Configured" : "Missing",
      url: hasSupabase ? publicEnv.supabaseUrl : null,
    },
    sepoliaRpc: {
      isConfigured: false, // Private server secret
      label: "Missing",
    },
    providerRegistry: {
      isDeployed: hasProvider,
      label: hasProvider ? "Deployed" : "Not configured",
      address: hasProvider ? publicEnv.providerRegistryAddress : null,
    },
    consentRegistry: {
      isDeployed: hasConsent,
      label: hasConsent ? "Deployed" : "Not configured",
      address: hasConsent ? publicEnv.consentRegistryAddress : null,
    },
    credentialRegistry: {
      isDeployed: hasCredential,
      label: hasCredential ? "Deployed" : "Not configured",
      address: hasCredential ? publicEnv.credentialRegistryAddress : null,
    },
    network: {
      chainId: publicEnv.chainId,
      name: publicEnv.networkName,
    },
  };
}
