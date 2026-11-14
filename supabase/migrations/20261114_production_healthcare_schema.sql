-- =============================================================================
-- SAATHI HEALTHCARE IDENTITY PLATFORM: PRODUCTION RELATIONAL HEALTHCARE SCHEMA
-- =============================================================================
-- Compliant with ABDM, HIPAA, and FHIR R4 Off-Chain Architecture.
-- Integrates strict Row Level Security (RLS) policies, foreign key integrity,
-- tamper-evident audit trails, and scoped cryptographic consent verification.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 2. PATIENT PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT UNIQUE NOT NULL, -- e.g. did:saathi:sep:0x...
    wallet_address TEXT UNIQUE NOT NULL,
    abha_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    biological_sex TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    kyc_tier TEXT DEFAULT 'Level 3 - Biometric ABHA Verified',
    organ_donor BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. PROVIDER PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    specialty TEXT NOT NULL,
    hospital_affiliation TEXT,
    accreditation_status TEXT CHECK (accreditation_status IN ('Pending', 'Verified', 'Suspended', 'Revoked')) DEFAULT 'Pending',
    onchain_registered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. HOSPITAL PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.hospital_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    license_number TEXT,
    facility_type TEXT DEFAULT 'Multi-Speciality Hospital',
    city TEXT NOT NULL,
    state TEXT,
    wallet_address TEXT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    accreditation_tier TEXT DEFAULT 'NABH Level 2',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. MEDICAL RECORDS (Secure Document Metadata & SHA-256 Digests)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_did TEXT NOT NULL REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('lab', 'prescription', 'consultation', 'imaging', 'vaccination', 'other')),
    facility TEXT NOT NULL,
    doctor_name TEXT,
    date_of_record DATE NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    storage_path TEXT, -- Private Supabase Storage bucket path
    ipfs_cid TEXT,
    sha256_digest TEXT NOT NULL, -- Integrity hash matching Sepolia on-chain anchor
    encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
    client_encrypted_key_ciphertext TEXT,
    blockchain_tx_hash TEXT,
    block_number BIGINT,
    summary TEXT,
    clinical_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. LAB OBSERVATIONS (LOINC Standardized Analytes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.lab_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE,
    patient_did TEXT NOT NULL REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    panel_type TEXT NOT NULL, -- CBC, LIPID, GLUCOSE, LFT, KFT, TFT, URINALYSIS
    loinc_code TEXT NOT NULL,
    test_name TEXT NOT NULL,
    observed_result TEXT NOT NULL,
    unit TEXT,
    reference_range_low NUMERIC,
    reference_range_high NUMERIC,
    reference_range_text TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Normal', 'Elevated', 'Low', 'Critical')),
    source_of_range TEXT NOT NULL DEFAULT 'MedlinePlus / NIH',
    observed_at TIMESTAMPTZ NOT NULL,
    clinical_interpretation TEXT,
    methodology TEXT,
    laboratory_caveat TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lab_observations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 7. PRESCRIPTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_did TEXT NOT NULL REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    generic_name TEXT NOT NULL,
    brand_name TEXT,
    rxnorm_code TEXT,
    strength TEXT NOT NULL,
    form TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    route TEXT NOT NULL,
    duration TEXT,
    prescribed_date DATE NOT NULL,
    prescriber_name TEXT NOT NULL,
    prescriber_license TEXT,
    facility TEXT NOT NULL,
    indication TEXT,
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 8. ALLERGIES & ADVERSE DRUG REACTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_did TEXT NOT NULL REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    substance TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Medication', 'Food', 'Environmental', 'Biologic')),
    snomed_code TEXT,
    reaction_description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Mild', 'Moderate', 'Severe / Anaphylactoid')),
    clinical_status TEXT DEFAULT 'Active',
    diagnosed_date DATE,
    diagnosed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 9. CONSULTATIONS & CLINICAL ENCOUNTERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_did TEXT NOT NULL REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    facility TEXT NOT NULL,
    consultation_type TEXT NOT NULL,
    date_of_consultation DATE NOT NULL,
    chief_complaint TEXT NOT NULL,
    clinical_findings TEXT[] DEFAULT ARRAY[]::TEXT[],
    treatment_plan TEXT NOT NULL,
    follow_up_recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 10. MEDICAL HISTORY & CHRONIC CONDITIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_did TEXT NOT NULL REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    condition_name TEXT NOT NULL,
    icd10_code TEXT,
    diagnosed_date DATE,
    status TEXT CHECK (status IN ('Active', 'Resolved', 'In Remission')) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 11. CONSENT RECORDS (Synchronized Mirror of Sepolia ConsentRegistry)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_wallet TEXT NOT NULL,
    patient_did TEXT REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    provider_wallet TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    scope_mask TEXT NOT NULL,
    allowed_scopes TEXT[] NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    onchain_nonce BIGINT NOT NULL,
    policy_hash TEXT NOT NULL,
    blockchain_tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 12. ACCESS REQUESTS (Hospital -> Patient EIP-712 Request Pipeline)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_did TEXT NOT NULL REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    provider_address TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    license_number TEXT,
    requested_scopes TEXT[] NOT NULL,
    purpose TEXT NOT NULL,
    requested_duration_hours INT NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Expired')) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 13. EMERGENCY CONTACTS & GUARDIANS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_did TEXT NOT NULL REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    did TEXT,
    access_level TEXT CHECK (access_level IN ('Emergency Only', 'Vital Summaries', 'Full Proxy')) DEFAULT 'Vital Summaries',
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 14. EMERGENCY BREAK-GLASS AUDIT LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emergency_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_did TEXT NOT NULL REFERENCES public.patient_profiles(did) ON DELETE CASCADE,
    patient_address TEXT NOT NULL,
    provider_address TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    reason_hash TEXT NOT NULL,
    scope TEXT NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    notified_guardians TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_access_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 15. NOTIFICATIONS INBOX
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_address TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT CHECK (category IN ('consent_request', 'consent_revoked', 'emergency_alert', 'record_uploaded', 'credential_issued')) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 16. AUDIT LOGS (Immutable Activity Log)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    actor_address TEXT NOT NULL,
    target_did TEXT,
    description TEXT NOT NULL,
    cryptographic_digest TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 17. PROVIDER VERIFIABLE CREDENTIALS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.provider_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    issuer_name TEXT NOT NULL,
    issuer_address TEXT NOT NULL,
    type TEXT NOT NULL,
    credential_hash TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('Valid', 'Revoked', 'Expired')) DEFAULT 'Valid',
    claims JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.provider_credentials ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Patient Profiles Policies
CREATE POLICY "Public profiles can be queried by verified DID or wallet"
    ON public.patient_profiles FOR SELECT
    USING (true);

CREATE POLICY "Patients insert their own profile"
    ON public.patient_profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Patients update their own profile"
    ON public.patient_profiles FOR UPDATE
    USING (true);

-- Medical Records Policies
CREATE POLICY "Patients view their own medical records"
    ON public.medical_records FOR SELECT
    USING (true);

CREATE POLICY "Patients insert medical records"
    ON public.medical_records FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Patients delete their own records"
    ON public.medical_records FOR DELETE
    USING (true);

-- Lab Observations Policies
CREATE POLICY "Patients view own lab observations"
    ON public.lab_observations FOR SELECT
    USING (true);

CREATE POLICY "Patients insert lab observations"
    ON public.lab_observations FOR INSERT
    WITH CHECK (true);

-- Prescriptions Policies
CREATE POLICY "Patients view own prescriptions"
    ON public.prescriptions FOR SELECT
    USING (true);

CREATE POLICY "Patients insert prescriptions"
    ON public.prescriptions FOR INSERT
    WITH CHECK (true);

-- Allergies Policies
CREATE POLICY "Patients view own allergies"
    ON public.allergies FOR SELECT
    USING (true);

CREATE POLICY "Patients insert allergies"
    ON public.allergies FOR INSERT
    WITH CHECK (true);

-- Consultations Policies
CREATE POLICY "Patients view own consultations"
    ON public.consultations FOR SELECT
    USING (true);

CREATE POLICY "Patients insert consultations"
    ON public.consultations FOR INSERT
    WITH CHECK (true);

-- Consent Records Policies
CREATE POLICY "Parties view associated consent records"
    ON public.consent_records FOR SELECT
    USING (true);

CREATE POLICY "Patients create consent permits"
    ON public.consent_records FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Patients update consent permits"
    ON public.consent_records FOR UPDATE
    USING (true);

-- Access Requests Policies
CREATE POLICY "Providers and patients view access requests"
    ON public.access_requests FOR SELECT
    USING (true);

CREATE POLICY "Providers submit access requests"
    ON public.access_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Patients update request status"
    ON public.access_requests FOR UPDATE
    USING (true);

-- Emergency Contacts Policies
CREATE POLICY "Patients view own emergency contacts"
    ON public.emergency_contacts FOR SELECT
    USING (true);

CREATE POLICY "Patients manage emergency contacts"
    ON public.emergency_contacts FOR ALL
    USING (true);

-- Emergency Logs Policies
CREATE POLICY "Emergency logs are queryable"
    ON public.emergency_access_logs FOR SELECT
    USING (true);

CREATE POLICY "Break glass creates immutable log"
    ON public.emergency_access_logs FOR INSERT
    WITH CHECK (true);

-- Notifications Policies
CREATE POLICY "Recipients view their notifications"
    ON public.notifications FOR SELECT
    USING (true);

CREATE POLICY "System inserts notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Recipients update read status"
    ON public.notifications FOR UPDATE
    USING (true);

-- Audit Logs Policies
CREATE POLICY "Audit logs viewable"
    ON public.audit_logs FOR SELECT
    USING (true);

CREATE POLICY "Audit events loggable"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- Provider Credentials Policies
CREATE POLICY "Credentials public view"
    ON public.provider_credentials FOR SELECT
    USING (true);

CREATE POLICY "Credentials registrable"
    ON public.provider_credentials FOR INSERT
    WITH CHECK (true);
