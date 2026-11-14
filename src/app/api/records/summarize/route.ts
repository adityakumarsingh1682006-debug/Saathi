import { NextRequest, NextResponse } from "next/server";
import { summarizeMedicalReport, ReportInputData } from "@/lib/ai/report-summarizer";
import { recordService, consentService } from "@/lib/database/service";
import { pinataService } from "@/lib/ipfs/pinata";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, patientDid, reportData } = body;

    // 1. Authorization check
    const requester = patientDid || req.headers.get("x-requester-did") || "";
    if (!requester) {
      return NextResponse.json(
        { error: "Unauthorized: Patient DID or authentication credentials required to summarize medical records." },
        { status: 401 }
      );
    }

    let inputData: ReportInputData = reportData || {};

    // 2. If a specific document ID is referenced, verify database record and permissions
    if (reportId) {
      const records = await recordService.getRecords(requester);
      let target = records.find((r) => r.id === reportId);

      if (!target) {
        const demoRecords = await recordService.getRecords("did:saathi:sep:0x9F64A810928B8d9a2217cCd6498F2817e01239Aa");
        target = demoRecords.find((r) => r.id === reportId);
      }

      if (!target) {
        try {
          const { INITIAL_RECORDS } = await import("@/lib/mock-data");
          const m = INITIAL_RECORDS.find((r) => r.id === reportId);
          if (m) {
            target = {
              id: m.id,
              patient_did: requester,
              title: m.title,
              category: m.category,
              facility: m.facility,
              doctor_name: m.doctorName,
              date_of_record: m.date,
              file_type: m.fileType as any,
              file_size_bytes: 1024,
              ipfs_hash: m.ipfsHash,
              sha256_digest: m.sha256Digest,
              summary: m.summary,
              clinical_details: m.clinicalDetails,
            };
          }
        } catch {}
      }

      if (target) {
        // Verify ownership or consent
        const isOwner = target.patient_did.toLowerCase() === requester.toLowerCase();
        let hasConsent = false;
        if (!isOwner) {
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
            { error: "Forbidden: You do not have valid consent to process this medical record." },
            { status: 403 }
          );
        }

        // If IPFS CID is present, retrieve and decrypt to check for findings
        const ipfsCid = target.ipfs_cid || target.ipfs_hash;
        let decryptedText = "";
        if (ipfsCid) {
          try {
            const dec = await pinataService.retrieveAndDecryptDocument(ipfsCid, target.patient_did, target.id);
            // If text / utf-8 plaintext
            decryptedText = dec.plaintextBuffer.toString("utf-8");
          } catch (e) {
            console.warn("Could not decrypt IPFS buffer for summary:", e);
          }
        }

        inputData = {
          reportId: target.id,
          title: target.title || inputData.title || "Clinical Report",
          category: target.category || inputData.category,
          facility: target.facility || inputData.facility,
          doctorName: target.doctor_name || inputData.doctorName,
          date: target.date_of_record || inputData.date,
          analytes: inputData.analytes && inputData.analytes.length > 0 ? inputData.analytes : undefined,
          findings: [
            ...((target.clinical_details?.findings as string[]) || []),
            ...(inputData.findings || []),
            ...(target.summary ? [target.summary] : []),
          ].filter((v, i, a) => a.indexOf(v) === i),
          rawText: decryptedText || inputData.rawText,
        };
      }
    }

    if (!inputData.title) {
      return NextResponse.json({ error: "Invalid report data: title is required." }, { status: 400 });
    }

    // 3. Generate Gemini Summary
    const summary = await summarizeMedicalReport(inputData);

    return NextResponse.json({
      success: true,
      reportId: reportId || inputData.reportId,
      summary,
    });
  } catch (error: any) {
    console.error("Report summarization route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal error generating clinical summary." },
      { status: 500 }
    );
  }
}
