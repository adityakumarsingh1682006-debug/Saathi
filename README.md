# SAATHI — Your Health. Your Identity. Your Control.

<p align="center">
  <strong>A patient-centric digital healthcare identity and medical records platform.</strong>
  <br />
  Empowering individuals with secure, accessible, and patient-controlled healthcare information.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-Enabled-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Solidity-Smart%20Contracts-363636?logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/Network-Ethereum%20Sepolia-627EEA?logo=ethereum" alt="Ethereum" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-8E75B2" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Storage-IPFS-65C2CB" alt="IPFS" />
</p>

---

## 🌐 Overview

Healthcare information is often fragmented across hospitals, diagnostic laboratories, clinics, and individual records.

Patients frequently struggle to access their medical history, share reports securely, and maintain control over who can view their sensitive health information.

**SAATHI** aims to address this problem through a unified, patient-centric digital healthcare identity and medical records platform.

It combines decentralized identity concepts, blockchain-based consent management, encrypted decentralized document storage, and AI-powered medical report explanations.

Instead of treating medical records as isolated documents owned by different institutions, SAATHI places the patient at the centre of healthcare information management.

### Our Vision

To make healthcare information more accessible, understandable, portable, and controlled by the people it belongs to.

---

## ✨ Key Features

### 1. 🪪 Digital Health Identity

A unified digital healthcare identity designed to help patients manage and verify their healthcare identity.

- Patient-centric digital identity.
- Decentralized Identifier (DID) integration.
- Digital Health ID card.
- QR-based identity verification.
- Patient identity management.

### 2. 📁 Secure Medical Records

A centralized interface for managing personal medical documents.

Patients can organize and access:

- Laboratory reports.
- Prescriptions.
- Doctor consultations.
- Medical history.
- Diagnostic documents.
- Other healthcare records.

Features include:

- Medical document uploads.
- Encrypted document storage.
- Secure document retrieval.
- Organized medical record management.
- Patient-friendly report viewing.

### 3. 🔐 Patient-Controlled Consent

Patients should decide who can access their medical information and under what conditions.

SAATHI uses Ethereum smart contracts to support consent management.

- Scoped access permissions.
- Provider authorization.
- Consent granting and revocation.
- Credential status verification.
- Time-limited emergency access mechanisms.

The goal is to give patients greater transparency and control over medical information sharing.

### 4. ☁️ Encrypted Decentralized Storage

SAATHI integrates Pinata and IPFS for decentralized medical document storage.

Security architecture includes:

- AES-256-GCM authenticated encryption.
- Randomized initialization vectors.
- Authentication tags.
- HKDF-SHA256-based document key derivation.
- Server-side encryption and decryption.
- Encrypted document retrieval.

**Important:** Medical documents are encrypted before being uploaded to IPFS. The blockchain is not used to store raw medical reports or personally identifiable medical information.

### 5. 🤖 Gemini-Powered Medical Report Summaries

SAATHI integrates Google's Gemini API to make medical reports easier to understand.

Patients can open an uploaded report and generate an AI-powered explanation.

The summary interface is designed to provide:

- Plain-English report summaries.
- Important findings.
- Explanation of medical terminology.
- Values to discuss with a doctor.
- Questions patients can ask their healthcare provider.

The AI feature is intended for educational assistance, not medical diagnosis or treatment.

### 6. 👨‍👩‍👧 Family & Guardians

A family-oriented healthcare management interface.

Designed to support:

- Family member management.
- Guardian relationships.
- Controlled access delegation.
- Individual patient privacy.

Adult family members retain control over their own healthcare information.

### 7. 🚨 Emergency Access

Healthcare emergencies may require access to essential medical information when normal consent workflows are impractical.

SAATHI includes an emergency access mechanism designed around restricted, time-limited permissions and provider authorization.

### 8. 🏥 Hospital Portal

A dedicated provider-facing interface intended to support healthcare provider workflows, identity verification, and authorized medical record access.

---

## 🏗️ Technology Stack

SAATHI combines modern web technologies with blockchain infrastructure and AI services.

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 |
| UI Framework | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Animations | Motion |
| 3D Graphics | React Three Fiber |
| Backend | Next.js API Routes |
| Database | Supabase |
| Authentication | Supabase Auth |
| Decentralized Storage | IPFS |
| Storage Provider | Pinata |
| Encryption | AES-256-GCM |
| Key Derivation | HKDF-SHA256 |
| Blockchain | Ethereum |
| Development Network | Sepolia Testnet |
| Smart Contracts | Solidity |
| Contract Framework | Hardhat |
| Contract Libraries | OpenZeppelin |
| Blockchain Integration | ethers.js |
| AI Integration | Google Gemini API |
| AI SDK | @google/genai |

---

## 🧠 System Architecture

SAATHI separates patient information management, document storage, authorization, and blockchain-based consent verification.

```text
                    PATIENT
                       |
                       v
              SAATHI WEB APPLICATION
                  Next.js / React
                       |
          +------------+------------+
          |            |            |
          v            v            v
      SUPABASE      NEXT.JS API   ETHEREUM
      AUTH & DB       ROUTES       SEPOLIA
          |            |            |
          |            |       Smart Contracts
          |            |            |
          |            |       +----+------+
          |            |       |           |
          |            |       v           v
          |            |   Provider    Consent
          |            |   Registry    Registry
          |            |
          |       +----+------------------+
          |       |                       |
          |       v                       v
          |   ENCRYPTION              GEMINI API
          |   AES-256-GCM                 |
          |       |                      v
          |       v                 AI REPORT
          |   PINATA / IPFS         SUMMARIES
          |       |
          |       v
          |   ENCRYPTED
          |   DOCUMENTS
          |
          v
     RECORD METADATA
     & PATIENT DATA
```

### Data Flow

**Medical document workflow:**

1. Patient uploads a medical document.
2. The server validates the upload and authorization.
3. The document is encrypted using AES-256-GCM.
4. Encrypted document content is uploaded to IPFS through Pinata.
5. Document metadata and storage references are maintained through Supabase.
6. Authorized users can retrieve the document through the application.
7. The server verifies access permissions and decrypts the document when authorized.

**AI report summarization workflow:**

1. Patient opens an uploaded medical report.
2. Patient selects Generate AI Summary.
3. The application sends a request to the server.
4. The server verifies authentication, ownership, and authorization.
5. The encrypted document is retrieved and decrypted.
6. Authorized report content is processed through the Google Gemini API.
7. Gemini generates a structured explanation.
8. The result is displayed inside the medical report interface.

---

## ⛓️ Smart Contracts

SAATHI uses Ethereum Sepolia smart contracts to support decentralized authorization and credential management.

### ProviderRegistry.sol

Designed to manage healthcare provider accreditation.

Capabilities include:

- Provider registration and accreditation management.
- Provider suspension.
- Provider reactivation.
- Provider revocation.

### ConsentRegistry.sol

Designed to manage patient consent and delegated access.

Capabilities include:

- Structured consent permissions.
- Scoped access authorization.
- Consent revocation.
- Provider registry verification.
- Time-limited emergency access.
- EIP-712 structured signatures.

### CredentialStatusRegistry.sol

Designed to maintain credential status information.

Capabilities include:

- Credential hash registration.
- Credential revocation.
- Expiry management.
- Issuer-based authorization.

**Network:** Ethereum Sepolia Testnet

No raw medical reports, diagnoses, or sensitive patient records should be written to the blockchain.

---

## 🔒 Security & Privacy

Healthcare information requires a strong privacy-first architecture.

SAATHI is designed around the following principles:

- Patient-centric data ownership.
- Encryption before decentralized storage.
- Server-side handling of sensitive operations.
- Explicit authorization checks.
- Scoped consent permissions.
- Separation of medical documents and blockchain references.
- Minimal exposure of personally identifiable information.
- Secure handling of API credentials.

### Important Security Considerations

- AES-256-GCM provides authenticated encryption, but security also depends on encryption key management.
- Encryption secrets must be stored securely and never committed to GitHub.
- Gemini API keys and Pinata JWT credentials must remain server-side.
- IPFS content identifiers should not expose patient identity.
- Blockchain transactions should contain only appropriate hashes, permissions, or credential references.
- Access revocation must be enforced by the application and authorization layer.

SAATHI is an evolving project. Its security architecture requires independent security testing before real-world clinical deployment.

---

## 🖥️ Application Modules

| Module | Purpose |
|---|---|
| Dashboard | Patient overview |
| Digital Health ID | Identity management and verification |
| Medical Records | Medical document repository |
| Gemini Report Summary | AI-powered report explanations |
| Access & Consent | Patient-controlled permissions |
| Family & Guardians | Family healthcare management |
| Emergency Access | Restricted emergency authorization |
| Hospital Portal | Provider-facing workflows |
| Settings | Account and application configuration |

---

## ⚙️ Getting Started

Follow these steps to run SAATHI locally.

### Prerequisites

Install:

- Node.js 20 or later.
- npm.
- Git.
- A Supabase project.
- A Pinata account.
- A Google Gemini API key.
- MetaMask or another compatible Ethereum wallet.

### 1. Clone the Repository

```bash
git clone https://github.com/adityakumarsingh1682006-debug/Saathi.git

cd Saathi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root.

Add the following configuration:

```env
# Google Gemini
GEMINI_API_KEY=
GEMINI_MODEL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pinata / IPFS
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

**Important:**

- Use your own API credentials.
- Configure `GEMINI_MODEL` with a currently supported model available to your API key.
- Generate a cryptographically secure encryption secret.
- Obtain contract addresses from your actual deployment.
- Never commit `.env.local` to GitHub.
- Never expose the Supabase service-role key, Pinata JWT, deployer private key, or encryption secret in frontend code.

### 4. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🧪 Development & Verification

Useful project commands:

### Development

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

For smart contract development, use the configured Hardhat scripts in the project.

Before deploying, verify the active network, deployment addresses, environment configuration, and contract permissions.

---

## 🗺️ Project Roadmap

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

### Further Development

- [ ] Independent smart contract security audit.
- [ ] Independent application security assessment.
- [ ] Production-grade encryption key management.
- [ ] Comprehensive provider onboarding verification.
- [ ] Broader healthcare interoperability through FHIR.
- [ ] Expanded real-world hospital integration.
- [ ] Production infrastructure and compliance assessment.
- [ ] Clinical validation of AI-assisted report explanations.

---

## ⚠️ Disclaimer

SAATHI is a healthcare technology development project.

It is not a replacement for hospitals, healthcare professionals, diagnostic laboratories, or professional medical advice.

Gemini-powered report summaries are intended for educational and informational purposes only.

AI-generated explanations may contain errors or omit clinically relevant information. Patients should always consult qualified healthcare professionals when interpreting medical results or making healthcare decisions.

The current blockchain implementation uses the Ethereum Sepolia testnet and is not a production healthcare network.

Do not upload real patient information to an unverified or development deployment.

---

## 🤝 Contributing

Contributions, suggestions, and technical feedback are welcome.

If you want to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your implementation.
5. Submit a pull request describing your contribution.

Please avoid submitting API credentials, private keys, encryption secrets, or identifiable patient information.

---

## 👨‍💻 Project

**SAATHI — Your Health. Your Identity. Your Control.**

Built with the vision of making healthcare information more accessible, secure, and patient-centric.

**Developer:** Aditya Kr Singh

**Repository:** `adityakumarsingh1682006-debug/Saathi`

**Blockchain Network:** Ethereum Sepolia

---

<p align="center">
  <strong>Healthcare should be centred around the patient.</strong>
  <br />
  SAATHI is building towards that future.
</p>
