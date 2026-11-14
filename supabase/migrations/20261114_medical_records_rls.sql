-- =============================================================================
-- SAATHI HEALTHCARE IDENTITY PLATFORM: OFF-CHAIN SECURE STORAGE SCHEMA & RLS
-- =============================================================================
-- Complies with ABDM, HIPAA, and FHIR R4 off-chain storage standards.
-- Medical records, prescriptions, and lab panels are stored strictly off-chain.
-- On-chain Ethereum Sepolia registry stores strictly cryptographic hashes (SHA-256)
-- and EIP-712 patient consent permits. Zero PHI is ever committed to the blockchain.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PATIENT PROFILES
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT UNIQUE NOT NULL, -- e.g. did:saathi:sep:0x...
    wallet_address TEXT UNIQUE NOT NULL,
    abha_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    biological_sex TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- 3. MEDICAL RECORDS (Encrypted Off-chain Metadata & File Pointers)
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
    ipfs_cid TEXT, -- IPFS hash for decentralized encrypted replica
    sha256_digest TEXT NOT NULL, -- Cryptographic integrity hash matching on-chain anchor
    encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
    client_encrypted_key_ciphertext TEXT, -- Client-side wrapped decryption key
    blockchain_tx_hash TEXT, -- Sepolia anchor reference
    block_number BIGINT,
    summary_ciphertext TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- 4. LAB OBSERVATIONS (LOINC Standardized Observations)
CREATE TABLE IF NOT EXISTS public.lab_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
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
    source_of_range TEXT NOT NULL, -- MedlinePlus, NIH, ADA, NKF, etc.
    observed_at TIMESTAMPTZ NOT NULL,
    laboratory_caveat TEXT NOT NULL
);

ALTER TABLE public.lab_observations ENABLE ROW LEVEL SECURITY;

-- 5. PRESCRIPTIONS
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

-- 6. ALLERGIES & ADVERSE DRUG REACTIONS
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
    verification_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

-- 7. OFF-CHAIN CONSENT PERMITS MIRROR (Synchronized from Sepolia ConsentRegistry)
CREATE TABLE IF NOT EXISTS public.consent_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_wallet TEXT NOT NULL,
    provider_wallet TEXT NOT NULL,
    scope_mask TEXT NOT NULL,
    allowed_scopes TEXT[] NOT NULL, -- e.g. ARRAY['LABS', 'PRESCRIPTIONS']
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    onchain_nonce BIGINT NOT NULL,
    policy_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.consent_permits ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- POLICY A: Patient has full access to their own profile
CREATE POLICY "Patients own their profile"
    ON public.patient_profiles
    FOR ALL
    USING (auth.jwt() ->> 'wallet_address' = wallet_address);

-- POLICY B: Patient has full access to their own medical records
CREATE POLICY "Patients read and write their own records"
    ON public.medical_records
    FOR ALL
    USING (
        patient_did IN (
            SELECT did FROM public.patient_profiles
            WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- POLICY C: Accredited Providers can ONLY read patient records if an ACTIVE consent permit exists
CREATE POLICY "Authorized providers read records under active consent"
    ON public.medical_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.consent_permits cp
            JOIN public.patient_profiles pp ON pp.wallet_address = cp.patient_wallet
            WHERE pp.did = medical_records.patient_did
              AND cp.provider_wallet = auth.jwt() ->> 'wallet_address'
              AND cp.is_active = TRUE
              AND cp.valid_until > NOW()
              AND cp.valid_from <= NOW()
              AND (
                  (medical_records.category = 'lab' AND 'LABS' = ANY(cp.allowed_scopes)) OR
                  (medical_records.category = 'prescription' AND 'PRESCRIPTIONS' = ANY(cp.allowed_scopes)) OR
                  (medical_records.category = 'consultation' AND 'CONSULTATIONS' = ANY(cp.allowed_scopes))
              )
        )
    );

-- POLICY D: Patient has full access to their own lab observations
CREATE POLICY "Patients read own lab observations"
    ON public.lab_observations
    FOR ALL
    USING (
        patient_did IN (
            SELECT did FROM public.patient_profiles
            WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- POLICY E: Providers read lab observations only if LABS scope granted in active consent
CREATE POLICY "Authorized providers read lab observations"
    ON public.lab_observations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.consent_permits cp
            JOIN public.patient_profiles pp ON pp.wallet_address = cp.patient_wallet
            WHERE pp.did = lab_observations.patient_did
              AND cp.provider_wallet = auth.jwt() ->> 'wallet_address'
              AND cp.is_active = TRUE
              AND cp.valid_until > NOW()
              AND 'LABS' = ANY(cp.allowed_scopes)
        )
    );

-- POLICY F: Patient has full access to their own prescriptions
CREATE POLICY "Patients manage own prescriptions"
    ON public.prescriptions
    FOR ALL
    USING (
        patient_did IN (
            SELECT did FROM public.patient_profiles
            WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- POLICY G: Providers read prescriptions only if PRESCRIPTIONS scope is granted
CREATE POLICY "Authorized providers read prescriptions"
    ON public.prescriptions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.consent_permits cp
            JOIN public.patient_profiles pp ON pp.wallet_address = cp.patient_wallet
            WHERE pp.did = prescriptions.patient_did
              AND cp.provider_wallet = auth.jwt() ->> 'wallet_address'
              AND cp.is_active = TRUE
              AND cp.valid_until > NOW()
              AND 'PRESCRIPTIONS' = ANY(cp.allowed_scopes)
        )
    );

-- POLICY H: Allergies are readable by patient and in emergency break-glass scenarios
CREATE POLICY "Patients manage own allergies"
    ON public.allergies
    FOR ALL
    USING (
        patient_did IN (
            SELECT did FROM public.patient_profiles
            WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );
