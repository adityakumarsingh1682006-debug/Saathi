import {
  DEMO_PATIENT,
  INITIAL_RECORDS,
  INITIAL_REQUESTS,
  INITIAL_PERMISSIONS,
  INITIAL_CREDENTIALS,
  INITIAL_GUARDIANS,
  INITIAL_EMERGENCY_LOGS,
} from "../mock-data";
import {
  SYNTHETIC_LAB_PANELS,
  SYNTHETIC_PRESCRIPTIONS,
  SYNTHETIC_ALLERGIES,
  SYNTHETIC_CONSULTATIONS,
  SYNTHETIC_TIMELINE,
} from "../medical/synthetic-records";
import {
  patientService,
  recordService,
  labService,
  prescriptionService,
  allergyService,
  consentService,
  requestService,
  emergencyService,
} from "./service";

/**
 * SEED UTILITY: Explicit Development & Clinical Simulation Fixture Loader.
 * Clearly demarcates synthetic test fixtures from live patient records.
 */
export async function seedDevelopmentFixtures(): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. Seed Profile
  await patientService.upsertProfile({
    did: DEMO_PATIENT.did,
    wallet_address: DEMO_PATIENT.walletAddress,
    abha_id: DEMO_PATIENT.abhaId,
    full_name: DEMO_PATIENT.name,
    date_of_birth: DEMO_PATIENT.dob,
    biological_sex: DEMO_PATIENT.gender,
    blood_group: DEMO_PATIENT.bloodGroup,
    phone: DEMO_PATIENT.emergencyContact.phone,
    kyc_tier: DEMO_PATIENT.kycTier,
    organ_donor: DEMO_PATIENT.organDonor,
  });

  // 2. Seed Medical Records
  for (const r of INITIAL_RECORDS) {
    await recordService.createRecord({
      id: r.id,
      patient_did: DEMO_PATIENT.did,
      title: r.title,
      category: r.category,
      facility: r.facility,
      doctor_name: r.doctorName,
      date_of_record: r.date,
      file_type: r.fileType,
      sha256_digest: r.sha256Digest,
      ipfs_cid: r.ipfsHash,
      blockchain_tx_hash: "0x" + Array.from({ length: 64 }, () => "d").join(""),
      block_number: r.blockNumber,
      summary: r.summary,
      clinical_details: r.clinicalDetails,
    });
  }

  // 3. Seed Prescriptions
  for (const rx of SYNTHETIC_PRESCRIPTIONS) {
    await prescriptionService.createPrescription({
      id: rx.id,
      patient_did: DEMO_PATIENT.did,
      generic_name: rx.genericName,
      brand_name: rx.brandName,
      rxnorm_code: rx.rxNormCode,
      strength: rx.strength,
      form: rx.form,
      dosage: rx.dosage,
      frequency: rx.frequency,
      route: rx.route,
      duration: rx.duration,
      prescribed_date: rx.prescribedDate,
      prescriber_name: rx.prescriberName,
      prescriber_license: rx.prescriberRegistration,
      facility: rx.facility,
      indication: rx.indication,
      special_instructions: rx.specialInstructions,
    });
  }

  // 4. Seed Allergies
  for (const alg of SYNTHETIC_ALLERGIES) {
    await allergyService.createAllergy({
      id: alg.id,
      patient_did: DEMO_PATIENT.did,
      substance: alg.substance,
      category: alg.category,
      snomed_code: alg.snomedCode,
      reaction_description: alg.reaction,
      severity: alg.severity,
      clinical_status: alg.clinicalStatus,
      diagnosed_date: alg.diagnosedDate,
      diagnosed_by: alg.diagnosedBy,
    });
  }

  // 5. Seed Guardians
  for (const g of INITIAL_GUARDIANS) {
    await emergencyService.addGuardian({
      id: g.id,
      patient_did: DEMO_PATIENT.did,
      name: g.name,
      relationship: g.relationship,
      phone: g.phone,
      did: g.did,
      access_level: g.accessLevel,
      status: g.status,
    });
  }

  console.info("[Seed] Synthetic clinical test fixtures initialized.");
}
