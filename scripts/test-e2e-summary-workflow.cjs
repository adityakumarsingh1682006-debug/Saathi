const http = require("http");

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on("error", (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log("=======================================================");
  console.log("SAATHI END-TO-END GEMINI REPORT SUMMARY WORKFLOW TEST");
  console.log("=======================================================\n");

  const results = [];
  function assert(name, condition, details) {
    results.push({ name, passed: condition, details });
    const status = condition ? "✓ PASS" : "✗ FAIL";
    console.log(`[${status}] ${name}: ${details}`);
  }

  // 1. Check Dashboard is live and free of assistant links
  const dashRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/dashboard",
    method: "GET",
  });
  assert(
    "Dashboard Availability",
    dashRes.statusCode === 200,
    `Status ${dashRes.statusCode} returned`
  );
  assert(
    "Chatbot Nav Excision",
    !dashRes.body.includes('href="/dashboard/assistant"'),
    "No links to /dashboard/assistant found in dashboard HTML"
  );

  // 2. Check standalone assistant page is 404
  const asstRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/dashboard/assistant",
    method: "GET",
  });
  assert(
    "Assistant Chatbot Route Removal",
    asstRes.statusCode === 404,
    `GET /dashboard/assistant returned ${asstRes.statusCode} (Not Found)`
  );

  // 3. Test Unauthorized Request Rejection
  const unauthRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/records/summarize",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    JSON.stringify({
      reportData: { title: "Unauthenticated Test" },
    })
  );
  assert(
    "Patient Authorization Verification",
    unauthRes.statusCode === 401,
    `Request without patient DID correctly rejected with ${unauthRes.statusCode} Unauthorized`
  );

  // 4. Test Authorized Gemini Report Summary Generation
  const authorizedPayload = JSON.stringify({
    reportId: "panel-cbc-01",
    patientDid: "did:saathi:sep:0x9F64A810928B8d9a2217cCd6498F2817e01239Aa",
    reportData: {
      reportId: "panel-cbc-01",
      title: "Complete Blood Count (CBC)",
      facility: "Apollo Diagnostics",
      doctorName: "Dr. Ananya Sharma",
      date: "2026-11-12",
      category: "Hematology",
      analytes: [
        {
          name: "Hemoglobin",
          value: "14.2",
          unit: "g/dL",
          referenceRange: { textual: "13.0 - 17.0 g/dL" },
          status: "Normal",
        },
        {
          name: "White Blood Cells",
          value: "11,800",
          unit: "/mcL",
          referenceRange: { textual: "4,500 - 11,000 /mcL" },
          status: "Elevated",
        },
        {
          name: "Platelets",
          value: "280,000",
          unit: "/mcL",
          referenceRange: { textual: "150,000 - 450,000 /mcL" },
          status: "Normal",
        },
      ],
      findings: [
        "Mild leukocytosis noted. No acute cellular dysmorphia detected.",
      ],
    },
  });

  const sumRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/records/summarize",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(authorizedPayload),
      },
    },
    authorizedPayload
  );

  assert(
    "Gemini Summary API Response Status",
    sumRes.statusCode === 200,
    `POST /api/records/summarize returned ${sumRes.statusCode} OK`
  );

  let summary = null;
  try {
    const json = JSON.parse(sumRes.body);
    summary = json.summary;
  } catch (e) {
    console.error("Failed to parse JSON body:", sumRes.body);
  }

  assert(
    "Summary Object Generated",
    Boolean(summary && summary.summary),
    `Received summary payload: "${summary?.summary?.slice(0, 80)}..."`
  );

  assert(
    "Section 1: Plain-English Summary",
    typeof summary?.summary === "string" && summary.summary.length > 30,
    "Generated clear educational summary in simple English."
  );

  assert(
    "Section 2: Key Findings",
    Array.isArray(summary?.keyFindings) && summary.keyFindings.length > 0,
    `Identified ${summary?.keyFindings?.length || 0} key findings.`
  );

  assert(
    "Section 3: Values to Discuss with Doctor",
    Array.isArray(summary?.valuesToDiscuss) && summary.valuesToDiscuss.length > 0,
    `Identified ${summary?.valuesToDiscuss?.length || 0} flagged test value(s) for doctor discussion.`
  );

  assert(
    "Section 4: Medical Terms Explained",
    Array.isArray(summary?.medicalTermsExplained) && summary.medicalTermsExplained.length > 0,
    `Translated ${summary?.medicalTermsExplained?.length || 0} medical terminology entries into plain definitions.`
  );

  assert(
    "Section 5: Questions to Ask Your Doctor",
    Array.isArray(summary?.questionsToAskDoctor) && summary.questionsToAskDoctor.length > 0,
    `Suggested ${summary?.questionsToAskDoctor?.length || 0} specific questions for the physician.`
  );

  assert(
    "Section 6: Educational Guardrail Disclaimer",
    Boolean(summary?.educationalDisclaimer && summary.educationalDisclaimer.toLowerCase().includes("education")),
    "Mandatory non-diagnostic clinical disclaimer present."
  );

  // Summary
  console.log("\n=======================================================");
  console.log("E2E WORKFLOW VERIFICATION SUMMARY");
  console.log("=======================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`Total Checks: ${total}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

  if (failed === 0) {
    console.log("\n>>> ALL END-TO-END WORKFLOW CHECKS PASSED (100%) <<<\n");
  } else {
    console.error(`\n>>> ${failed} CHECK(S) FAILED <<<\n`);
    process.exitCode = 1;
  }
}

runE2ETests();
