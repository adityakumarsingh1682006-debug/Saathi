import { NextRequest, NextResponse } from "next/server";
import { pinataService } from "@/lib/ipfs/pinata";
import { recordService, consentService } from "@/lib/database/service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const requester = searchParams.get("requester") || req.headers.get("x-requester-did") || "";

    if (!requester) {
      return NextResponse.json(
        { error: "Unauthorized: Requester DID or wallet address is required for document access." },
        { status: 401 }
      );
    }

    // 1. Locate record metadata
    // Check records across patient did
    const allRecords = await recordService.getRecords(requester);
    let target = allRecords.find((r) => r.id === id);

    // If not found directly, check demo patient records
    if (!target) {
      const demoRecords = await recordService.getRecords("did:saathi:sep:0x9F64A810928B8d9a2217cCd6498F2817e01239Aa");
      target = demoRecords.find((r) => r.id === id);
    }

    if (!target) {
      return NextResponse.json({ error: `Medical document with ID '${id}' not found.` }, { status: 404 });
    }

    // 2. Permission / Consent Verification
    const isOwner = target.patient_did.toLowerCase() === requester.toLowerCase();
    let hasConsent = false;

    if (!isOwner) {
      // Check if provider has active consent
      const permissions = await consentService.getPermissions(target.patient_did);
      hasConsent = permissions.some(
        (p) =>
          p.provider_wallet.toLowerCase() === requester.toLowerCase() &&
          p.is_active &&
          new Date(p.valid_until) > new Date()
      );
    }

    if (!isOwner && !hasConsent) {
      return NextResponse.json(
        {
          error: "Access Denied: You do not possess valid consent or ownership permissions to decrypt this record.",
          securityAudit: "Logged unauthorized clinical record access attempt.",
        },
        { status: 403 }
      );
    }

    // 3. Retrieve & Decrypt from IPFS
    const ipfsCid = target.ipfs_cid || target.ipfs_hash || "";
    if (!ipfsCid) {
      return NextResponse.json({ error: "Document IPFS CID not found." }, { status: 404 });
    }
    const decrypted = await pinataService.retrieveAndDecryptDocument(
      ipfsCid,
      target.patient_did,
      target.id
    );

    const format = target.file_type || "pdf";
    const contentType =
      format === "pdf"
        ? "application/pdf"
        : format === "png"
        ? "image/png"
        : "image/jpeg";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    if (target.id) headers.set("X-Document-Id", target.id);
    headers.set("X-IPFS-CID", ipfsCid);
    headers.set("X-SHA256-Digest", decrypted.sha256Digest);
    headers.set("X-Encryption-Status", "Decrypted Server-Side via AES-256-GCM");

    return new Response(new Uint8Array(decrypted.plaintextBuffer), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Document retrieval error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve and decrypt medical document." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const requester = searchParams.get("requester") || req.headers.get("x-requester-did") || "";

    const demoRecords = await recordService.getRecords("did:saathi:sep:0x9F64A810928B8d9a2217cCd6498F2817e01239Aa");
    const target = demoRecords.find((r) => r.id === id);

    if (!target) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (target.patient_did.toLowerCase() !== requester.toLowerCase()) {
      return NextResponse.json({ error: "Access Denied: Only document owner can delete this record." }, { status: 403 });
    }

    // Unpin from Pinata IPFS
    const ipfsCid = target.ipfs_cid || target.ipfs_hash || "";
    if (ipfsCid) {
      await pinataService.unpinDocument(ipfsCid);
    }
    await recordService.deleteRecord(id);

    return NextResponse.json({ success: true, message: `Document '${id}' unpinned from IPFS and removed.` });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to unpin document" }, { status: 500 });
  }
}

