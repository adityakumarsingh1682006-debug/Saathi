# SAATHI — Your Health. Your Identity. Your Control.

<p align="center">
  <strong>A Decentralized, Patient-Centric Digital Healthcare Identity & Medical Records Platform</strong>
  <br />
  Secure healthcare information. Patient-controlled access. Intelligent medical report understanding.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-Enabled-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Backend-Pinata%20%7C%20IPFS-65C2CB" />
  <img src="https://img.shields.io/badge/Blockchain-Ethereum%20Sepolia-627EEA?logo=ethereum" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-8E75B2" />
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-success" />
</p>

---

## 🌐 About SAATHI

Healthcare information is often fragmented across hospitals, diagnostic laboratories, clinics, and individual medical records.

Patients frequently struggle to access their medical history, securely share reports, and maintain control over who can view their sensitive health information.

**SAATHI** is a decentralized healthcare identity and medical records platform designed to put patients at the centre of their healthcare journey.

By combining decentralized storage, blockchain-based consent management, cryptographic encryption, and AI-powered medical report explanations, SAATHI aims to make healthcare information more secure, accessible, understandable, and patient-controlled.

### Our Vision

To create a healthcare ecosystem where individuals can securely manage their medical identity, access their health records, and control how their information is shared.

**Your Health. Your Identity. Your Control.**

---

# ✨ Key Features

## 1. 🪪 Digital Health Identity

A unified digital healthcare identity designed to help patients manage and verify their healthcare information.

- Patient-centric digital identity.
- Decentralized Identifier (DID) integration.
- Digital Health ID card.
- QR-based identity verification.
- Patient identity management.

## 2. 📁 Secure Medical Records

A unified interface for organizing and accessing medical documents.

Supported record categories include:

- Laboratory reports.
- Prescriptions.
- Doctor consultations.
- Medical history.
- Diagnostic documents.
- Other healthcare records.

Features:

- Medical document uploads.
- Encrypted decentralized storage.
- Secure document retrieval.
- Organized medical record management.
- Patient-friendly report viewing.

## 3. ☁️ Pinata-Powered Decentralized Backend

**Pinata is SAATHI's primary decentralized document storage backend, powered by IPFS.**

Instead of relying entirely on conventional centralized file storage, SAATHI uses Pinata to store and retrieve encrypted medical documents through the InterPlanetary File System (IPFS).

Key capabilities:

- Decentralized medical document storage.
- Encrypted file uploads.
- IPFS content addressing.
- Secure document retrieval.
- Server-side Pinata integration.
- Document pinning and unpinning workflows.

Medical documents are encrypted before being uploaded to IPFS.

Raw medical reports and patient-sensitive information are not intentionally stored as publicly readable IPFS content.

## 4. 🔐 Patient-Controlled Consent Management

Patients should decide who can access their medical information and under what conditions.

SAATHI uses Ethereum smart contracts to support decentralized consent management.

Features include:

- Scoped access permissions.
- Provider authorization.
- Consent granting and revocation.
- Credential status verification.
- Time-limited emergency access mechanisms.

The objective is to give patients greater transparency and control over their healthcare information.

## 5. 🤖 Gemini-Powered Medical Report Summaries

SAATHI integrates Google's Gemini API to make medical reports easier to understand.

Patients can open an uploaded medical report and generate an AI-powered explanation.

The system is designed to provide:

- Plain-English medical report summaries.
- Important findings.
- Explanation of medical terminology.
- Values to discuss with a doctor.
- Questions patients can ask their healthcare provider.

The purpose is to make complex medical information easier for patients to understand.

AI-generated explanations are educational and are not a replacement for professional medical advice.

## 6. 👨‍👩‍👧 Family & Guardians

A family-oriented healthcare management interface designed to support:

- Family member management.
- Guardian relationships.
- Controlled access delegation.
- Individual patient privacy.

Adult family members retain control over their own healthcare information.

## 7. 🚨 Emergency Access

Healthcare emergencies may require access to essential medical information when normal consent workflows are impractical.

SAATHI includes an emergency access mechanism designed around restricted, time-limited permissions and provider authorization.

## 8. 🏥 Hospital Portal

A dedicated provider-facing interface intended to support healthcare provider workflows.

Designed to support:

- Provider registration.
- Provider identity verification.
- Accreditation management.
- Authorized patient record access.
- Healthcare information verification.

---

# 🏗️ Technology Stack

SAATHI combines modern web technologies, decentralized infrastructure, blockchain, and artificial intelligence.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16 | Web application |
| UI Framework | React 19 | User interface |
| Language | TypeScript | Application development |
| Styling | Tailwind CSS | UI styling |
| Components | shadcn/ui | Interface components |
| Animations | Motion | UI animations |
| 3D Graphics | React Three Fiber | 3D visual elements |
| Primary Decentralized Backend | Pinata | Decentralized document storage |
| Storage Network | IPFS | Content-addressed file storage |
| Application Backend | Next.js API Routes | Server-side operations |
| Database | Supabase | Patient profiles and record metadata |
| Authentication | Supabase Auth | User authentication |
| Encryption | AES-256-GCM | Document encryption |
| Key Derivation | HKDF-SHA256 | Encryption key derivation |
| Blockchain | Ethereum | Decentralized authorization |
| Network | Sepolia Testnet | Smart contract deployment |
| Smart Contracts | Solidity | Consent and provider registries |
| Contract Framework | Hardhat | Smart contract development |
| Contract Libraries | OpenZeppelin | Smart contract components |
| Blockchain Integration | ethers.js | Blockchain interaction |
| AI | Google Gemini | Medical report explanations |
| AI SDK | @google/genai | Gemini API integration |

---

# 🧠 System Architecture

SAATHI follows a decentralized storage architecture supported by blockchain-based authorization and conventional application services.

```text
                    PATIENT
                       |
                       v
              SAATHI WEB APPLICATION
                  Next.js / React
                       |
                 NEXT.JS API LAYER
                       |
       +---------------+----------------+
       |               |                |
       v               v                v
    PINATA          SUPABASE         ETHEREUM
    / IPFS          DATABASE          SEPOLIA
       |               |                |
       |               |          SMART CONTRACTS
       |               |                |
       |               |        +-------+-------+
       |               |        |               |
       |               |        v               v
       |               |     PROVIDER        CONSENT
       |               |     REGISTRY        REGISTRY
       |               |
       |               v
       |          PATIENT PROFILES
       |          RECORD METADATA
       |          AUTHENTICATION
       |
       v
  ENCRYPTED MEDICAL
     DOCUMENTS
       |
       v
  AUTHORIZED RETRIEVAL
       |
       v
  SERVER-SIDE DECRYPTION
       |
       +--------------------+
                            |
                            v
                       GEMINI API
                            |
                            v
                    AI REPORT SUMMARY
```

## Data Flow

### Medical Document Upload

1. Patient uploads a medical document.
2. The Next.js backend validates the request and authorization.
3. The document is encrypted using AES-256-GCM.
4. The encrypted document is uploaded to Pinata through its API.
5. IPFS returns a content identifier (CID).
6. Supabase stores the relevant record metadata and storage reference.
7. The patient can access the document through SAATHI.

### Medical Document Retrieval

1. Patient requests an existing medical record.
2. The server verifies authentication and authorization.
3. The encrypted document is retrieved from Pinata/IPFS.
4. The server decrypts the document after successful authorization.
5. The document is returned to the authorized user.

### Gemini Medical Report Summarization

1. Patient opens a medical report.
2. Patient clicks **Generate AI Summary**.
3. The application sends a request to the backend.
4. The backend verifies patient authentication and document access permissions.
5. The encrypted report is retrieved from Pinata/IPFS.
6. The report is decrypted server-side.
7. Authorized report content is sent to the Gemini API.
8. Gemini dynamically generates a structured explanation.
9. The summary is displayed inside the medical report interface.

---

# ⛓️ Smart Contracts

SAATHI uses Ethereum Sepolia smart contracts to support decentralized authorization and credential management.

### ProviderRegistry.sol

Designed to manage healthcare provider accreditation.

Capabilities:

- Provider registration and accreditation.
- Provider suspension.
- Provider reactivation.
- Provider revocation.

### ConsentRegistry.sol

Designed to manage patient consent and delegated access.

Capabilities:

- Structured consent permissions.
- Scoped access authorization.
- Consent revocation.
- Provider registry verification.
- Time-limited emergency access.
- EIP-712 structured signatures.

### CredentialStatusRegistry.sol

Designed to maintain credential status information.

Capabilities:

- Credential hash registration.
- Credential revocation.
- Expiry management.
- Issuer-based authorization.

**Blockchain Network:** Ethereum Sepolia Testnet.

Raw medical reports, diagnoses, and sensitive patient records are not intended to be stored on-chain.

---

# 🔒 Security & Privacy

Healthcare information requires a privacy-first architecture.

SAATHI is designed around the following principles:

- Patient-centric information management.
- Encryption before decentralized storage.
- Server-side handling of sensitive operations.
- Explicit authorization checks.
- Scoped consent permissions.
- Separation of medical documents and blockchain references.
- Minimal exposure of personally identifiable information.
- Secure API credential management.

### Encryption Architecture

SAATHI implements:

- AES-256-GCM authenticated encryption.
- Random 96-bit initialization vectors.
- Authentication tags.
- HKDF-SHA256-based document key derivation.
- Server-side encryption and decryption.

Security also depends on proper encryption key storage, backup, recovery, rotation, and access management.

### Privacy Considerations

- Pinata JWT credentials remain server-side.
- Gemini API keys remain server-side.
- Supabase service-role credentials must never be exposed to browsers.
- Patient-sensitive information should not be placed in public blockchain transactions.
- IPFS content identifiers should not reveal patient identity.
- Unauthorized users must not be able to retrieve or decrypt medical documents.

SAATHI is an evolving project and requires independent security assessment before real-world clinical deployment.

---

# 🖥️ Application Modules

| Module | Description |
|---|---|
| Dashboard | Patient healthcare overview |
| Digital Health ID | Patient identity management |
| Medical Records | Medical document repository |
| Gemini AI Summary | AI-powered report explanations |
| Access & Consent | Patient-controlled permissions |
| Family & Guardians | Family healthcare management |
| Emergency Access | Restricted emergency authorization |
| Hospital Portal | Provider-facing interface |
| Settings | Account and application configuration |

---

# ⚙️ Getting Started

Follow these steps to run SAATHI locally.

## Prerequisites

Install:

- Node.js 20 or later.
- npm.
- Git.
- Supabase account.
- Pinata account.
- Google Gemini API key.
- MetaMask or another compatible Ethereum wallet.

## 1. Clone the Repository

```bash
git clone https://github.com/adityakumarsingh1682006-debug/Saathi.git

cd Saathi
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
# Google Gemini
GEMINI_API_KEY=
GEMINI_MODEL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pinata / IPFS Backend
PINATA_JWT=
NEXT_PUBLIC_PINATA_GATEWAY=

# Document Encryption
DOCUMENT_ENCRYPTION_SECRET=

# Ethereum Sepolia
SEPOLIA_RPC_URL=
DEPLOYER_PRIVATE_KEY=

NEXT_PUBLIC_PROVIDER_REGISTRY_ADDRESS=
NEXT_PUBLIC_CONSENT_REGISTRY_ADDRESS=
NEXT_PUBLIC_CREDENTIAL_STATUS_REGISTRY_ADDRESS=

NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Sepolia

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Environment Configuration Notes

- Obtain Pinata credentials from your Pinata dashboard.
- Obtain Gemini credentials from Google AI Studio.
- Configure Supabase using your own project credentials.
- Generate a cryptographically secure document encryption secret.
- Use the actual smart contract addresses from your Sepolia deployment.
- Set `GEMINI_MODEL` to a model currently supported by your Google AI API configuration.

**Never commit `.env.local` or expose private credentials in frontend code.**

## 4. Start the Development Server

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

---

# 🧪 Development & Verification

Useful development commands:

### Start Development Server

```bash
npm run dev
```

### TypeScript Validation

```bash
npx tsc --noEmit
```

### Production Build

```bash
npm run build
```

For smart contract development, use the configured Hardhat scripts in the repository.

Before deployment, verify:

- Environment configuration.
- Active blockchain network.
- Smart contract addresses.
- Provider permissions.
- Consent verification.
- Encryption configuration.

---

# 🗺️ Roadmap

SAATHI is being developed as an evolving healthcare technology platform.

### Core Platform

- [x] Patient-facing dashboard.
- [x] Digital Health ID interface.
- [x] Medical records interface.
- [x] Patient identity and DID architecture.
- [x] Supabase integration.
- [x] Pinata/IPFS integration.
- [x] AES-256-GCM encryption implementation.
- [x] Gemini-powered medical report summarization.
- [x] Ethereum Sepolia smart contract implementation.
- [x] Consent management architecture.
- [x] Family and guardian interface.
- [x] Emergency access interface.
- [x] Hospital portal interface.

### Future Development

- [ ] Independent smart contract security audit.
- [ ] Independent application security assessment.
- [ ] Production-grade encryption key management.
- [ ] Comprehensive provider onboarding verification.
- [ ] Broader FHIR healthcare interoperability.
- [ ] Expanded hospital and diagnostic laboratory integrations.
- [ ] Production infrastructure and compliance assessment.
- [ ] Clinical validation of AI-assisted report explanations.

---

# ⚠️ Disclaimer

SAATHI is a healthcare technology development project.

It is not a replacement for hospitals, healthcare professionals, diagnostic laboratories, or professional medical advice.

Gemini-generated report explanations are intended for educational and informational purposes only.

AI-generated explanations may contain errors or omit clinically relevant information. Patients should consult qualified healthcare professionals when interpreting medical results or making healthcare decisions.

The current blockchain implementation uses the Ethereum Sepolia testnet and is not a production healthcare network.

Do not upload real patient information to an unverified development deployment.

---

# 🤝 Contributing

Contributions, suggestions, and technical feedback are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test your implementation.
5. Submit a pull request describing your contribution.

Please do not submit API credentials, private keys, encryption secrets, or identifiable patient information.

---

# 👨‍💻 Project Information

**Project:** SAATHI

**Tagline:** Your Health. Your Identity. Your Control.

**Developer:** Aditya Kr Singh

**Repository:** [SAATHI on GitHub](https://github.com/adityakumarsingh1682006-debug/Saathi)

**Primary Decentralized Backend:** Pinata / IPFS

**Blockchain Network:** Ethereum Sepolia Testnet

**AI Integration:** Google Gemini

---

<p align="center">
  <strong>Healthcare should be centred around the patient.</strong>
  <br />
  Building towards a more secure, accessible, and patient-controlled healthcare future.
</p>
