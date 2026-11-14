import { NextResponse } from "next/server";
import { pinataService } from "@/lib/ipfs/pinata";

export async function GET() {
  const pinataStatus = await pinataService.testConnection();
  const hasEncryptionSecret = Boolean(process.env.DOCUMENT_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET);

  return NextResponse.json({
    status: "ok",
    storage: {
      provider: "Pinata Cloud / IPFS",
      configured: pinataStatus.configured,
      authenticated: pinataStatus.authenticated,
      gateway: pinataStatus.gateway,
      message: pinataStatus.message,
    },
    security: {
      encryption: "AES-256-GCM Authenticated Encryption",
      keyDerivation: "HKDF-SHA256 with Unique IV (96-bit)",
      authTagLength: "128-bit",
      masterSecretActive: hasEncryptionSecret,
      rawPhiOnIpfs: false,
    },
  });
}
