import crypto from "crypto";

/**
 * SAATHI Medical Document Authenticated Encryption Engine
 * Implements authenticated AES-256-GCM encryption & decryption
 * 
 * SPECIFICATIONS:
 * - Cipher: AES-256-GCM (Authenticated Encryption with Associated Data)
 * - Key Size: 256 bits (32 bytes)
 * - IV (Initialization Vector): 96 bits (12 bytes) cryptographically random per encryption
 * - Auth Tag: 128 bits (16 bytes) authentication tag verifying ciphertext integrity
 * - Binary Envelope Structure:
 *   [Magic Header (4 bytes: "SMED")]
 *   [Version (1 byte: 0x01)]
 *   [IV (12 bytes)]
 *   [Auth Tag (16 bytes)]
 *   [Ciphertext (N bytes)]
 */

const MAGIC_HEADER = Buffer.from("SMED"); // SAATHI Medical Encrypted Document
const ENVELOPE_VERSION = 0x01;
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Returns or derives the master encryption secret from environment variables.
 * Never exposed to browser code or IPFS.
 */
function getMasterSecret(): Buffer {
  const secret = process.env.DOCUMENT_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET || "saathi-secure-clinical-vault-key-2026-v1";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Derives a unique 256-bit Document Encryption Key (DEK) using HKDF-SHA256
 * from the master secret, patient DID, and optional document salt.
 */
export function deriveDocumentKey(patientDid: string, docSalt: string = ""): Buffer {
  const masterKey = getMasterSecret();
  const info = `saathi-clinical-aes256gcm:${patientDid}:${docSalt}`;
  const salt = crypto.createHash("sha256").update(patientDid).digest();
  
  // Use HKDF (RFC 5869)
  return Buffer.from(crypto.hkdfSync("sha256", masterKey, salt, Buffer.from(info), KEY_LENGTH));
}

export interface EncryptedDocumentEnvelope {
  encryptedBuffer: Buffer;
  sha256Plaintext: string;
  sha256Ciphertext: string;
  ivHex: string;
  authTagHex: string;
  algorithm: "AES-256-GCM";
  envelopeVersion: number;
}

export interface DecryptedDocumentResult {
  plaintextBuffer: Buffer;
  sha256Digest: string;
  verified: boolean;
}

/**
 * Encrypts a medical document buffer using AES-256-GCM.
 * Generates a unique 96-bit random IV for every execution.
 */
export function encryptMedicalDocument(
  fileBuffer: Buffer,
  patientDid: string,
  docSalt: string = ""
): EncryptedDocumentEnvelope {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("Cannot encrypt empty document buffer");
  }

  // Calculate SHA-256 of plaintext for tamper verification
  const sha256Plaintext = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  // Derive unique 256-bit key for this patient/document
  const key = deriveDocumentKey(patientDid, docSalt);

  // Generate unique 96-bit random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Initialize cipher
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  // Encrypt
  const ciphertext = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Construct binary envelope: [MAGIC (4)][VER (1)][IV (12)][TAG (16)][CIPHERTEXT]
  const envelope = Buffer.concat([
    MAGIC_HEADER,
    Buffer.from([ENVELOPE_VERSION]),
    iv,
    authTag,
    ciphertext,
  ]);

  const sha256Ciphertext = crypto.createHash("sha256").update(envelope).digest("hex");

  return {
    encryptedBuffer: envelope,
    sha256Plaintext,
    sha256Ciphertext,
    ivHex: iv.toString("hex"),
    authTagHex: authTag.toString("hex"),
    algorithm: "AES-256-GCM",
    envelopeVersion: ENVELOPE_VERSION,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted medical document envelope.
 * Authenticates the GCM tag and header before returning plaintext.
 */
export function decryptMedicalDocument(
  encryptedEnvelope: Buffer,
  patientDid: string,
  docSalt: string = ""
): DecryptedDocumentResult {
  const minLength = MAGIC_HEADER.length + 1 + IV_LENGTH + TAG_LENGTH;
  if (!encryptedEnvelope || encryptedEnvelope.length < minLength) {
    throw new Error("Invalid encrypted envelope: payload too short or malformed");
  }

  // Check magic header
  const magic = encryptedEnvelope.subarray(0, 4);
  if (!magic.equals(MAGIC_HEADER)) {
    throw new Error("Invalid envelope: unrecognized magic header (not a SAATHI encrypted document)");
  }

  // Version check
  const version = encryptedEnvelope.readUInt8(4);
  if (version !== ENVELOPE_VERSION) {
    throw new Error(`Unsupported encryption envelope version: ${version}`);
  }

  let offset = 5;
  const iv = encryptedEnvelope.subarray(offset, offset + IV_LENGTH);
  offset += IV_LENGTH;

  const authTag = encryptedEnvelope.subarray(offset, offset + TAG_LENGTH);
  offset += TAG_LENGTH;

  const ciphertext = encryptedEnvelope.subarray(offset);

  // Derive the key
  const key = deriveDocumentKey(patientDid, docSalt);

  // Initialize decipher
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  try {
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const sha256Digest = crypto.createHash("sha256").update(plaintext).digest("hex");

    return {
      plaintextBuffer: plaintext,
      sha256Digest,
      verified: true,
    };
  } catch (err: any) {
    throw new Error(
      "Document decryption or authentication failed: auth tag mismatch or unauthorized key. Payload may have been tampered."
    );
  }
}
