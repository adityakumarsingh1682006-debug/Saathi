import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { ProviderRegistry, ConsentRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ConsentRegistry", function () {
  let providerRegistry: ProviderRegistry;
  let consentRegistry: ConsentRegistry;

  let admin: SignerWithAddress;
  let patient: SignerWithAddress;
  let accreditedProvider: SignerWithAddress;
  let unaccreditedProvider: SignerWithAddress;
  let relayer: SignerWithAddress;

  const SCOPE_LABS = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const SCOPE_PRESCRIPTIONS = "0x0000000000000000000000000000000000000000000000000000000000000002";
  const SCOPE_BOTH = "0x0000000000000000000000000000000000000000000000000000000000000003";
  const samplePolicyHash = ethers.keccak256(ethers.toUtf8Bytes("EncryptedPolicyDigest_EIP712_v1"));

  beforeEach(async function () {
    [admin, patient, accreditedProvider, unaccreditedProvider, relayer] = await ethers.getSigners();

    // 1. Deploy ProviderRegistry
    const ProviderRegistryFactory = await ethers.getContractFactory("ProviderRegistry");
    providerRegistry = await ProviderRegistryFactory.deploy();
    await providerRegistry.waitForDeployment();

    // 2. Deploy ConsentRegistry with ProviderRegistry dependency
    const ConsentRegistryFactory = await ethers.getContractFactory("ConsentRegistry");
    consentRegistry = await ConsentRegistryFactory.deploy(await providerRegistry.getAddress());
    await consentRegistry.waitForDeployment();

    // 3. Register and accredit accreditedProvider
    await providerRegistry.connect(accreditedProvider).registerProvider(
      "MED-HOSP-9921",
      "Fortis Memorial Research Institute",
      "IN-DEL",
      ethers.keccak256(ethers.toUtf8Bytes("FortisCredentials"))
    );
    await providerRegistry.connect(admin).accreditProvider(accreditedProvider.address, 365 * 24 * 3600);
  });

  it("5. Patient can grant consent directly on-chain", async function () {
    const duration = 24 * 3600; // 24 hours
    const tx = await consentRegistry.connect(patient).grantConsent(
      accreditedProvider.address,
      SCOPE_BOTH,
      duration,
      samplePolicyHash
    );
    await tx.wait();

    const hasAccess = await consentRegistry.hasValidConsent(
      patient.address,
      accreditedProvider.address,
      SCOPE_LABS
    );
    expect(hasAccess).to.be.true;

    const consent = await consentRegistry.consents(patient.address, accreditedProvider.address);
    expect(consent.isActive).to.be.true;
    expect(consent.patient).to.equal(patient.address);
    expect(consent.provider).to.equal(accreditedProvider.address);
    expect(consent.scopeMask).to.equal(SCOPE_BOTH);
  });

  it("6. Patient can revoke consent", async function () {
    const duration = 24 * 3600;
    await consentRegistry.connect(patient).grantConsent(
      accreditedProvider.address,
      SCOPE_LABS,
      duration,
      samplePolicyHash
    );

    expect(
      await consentRegistry.hasValidConsent(patient.address, accreditedProvider.address, SCOPE_LABS)
    ).to.be.true;

    await consentRegistry.connect(patient).revokeConsent(accreditedProvider.address);

    const consent = await consentRegistry.consents(patient.address, accreditedProvider.address);
    expect(consent.isActive).to.be.false;
  });

  it("7. Revoked consent becomes invalid immediately", async function () {
    const duration = 24 * 3600;
    await consentRegistry.connect(patient).grantConsent(
      accreditedProvider.address,
      SCOPE_LABS,
      duration,
      samplePolicyHash
    );
    await consentRegistry.connect(patient).revokeConsent(accreditedProvider.address);

    const hasAccess = await consentRegistry.hasValidConsent(
      patient.address,
      accreditedProvider.address,
      SCOPE_LABS
    );
    expect(hasAccess).to.be.false;
  });

  it("8. Expired consent becomes invalid automatically", async function () {
    const duration = 3600; // 1 hour
    await consentRegistry.connect(patient).grantConsent(
      accreditedProvider.address,
      SCOPE_LABS,
      duration,
      samplePolicyHash
    );

    expect(
      await consentRegistry.hasValidConsent(patient.address, accreditedProvider.address, SCOPE_LABS)
    ).to.be.true;

    // Fast-forward time past expiration
    await time.increase(3601);

    expect(
      await consentRegistry.hasValidConsent(patient.address, accreditedProvider.address, SCOPE_LABS)
    ).to.be.false;
  });

  it("9. Unaccredited providers cannot receive consent", async function () {
    const duration = 24 * 3600;
    await expect(
      consentRegistry.connect(patient).grantConsent(
        unaccreditedProvider.address,
        SCOPE_LABS,
        duration,
        samplePolicyHash
      )
    ).to.be.revertedWith("ConsentRegistry: provider not accredited");
  });

  it("10. Invalid EIP-712 signatures are rejected", async function () {
    const now = await time.latest();
    const validFrom = now;
    const validUntil = now + 48 * 3600;
    const nonce = await consentRegistry.nonces(patient.address);

    const domain = {
      name: "SAATHI Consent Gateway",
      version: "1.0",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: await consentRegistry.getAddress(),
    };

    const types = {
      ConsentPermit: [
        { name: "patient", type: "address" },
        { name: "provider", type: "address" },
        { name: "scopeMask", type: "bytes32" },
        { name: "validFrom", type: "uint256" },
        { name: "validUntil", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "policyHash", type: "bytes32" },
      ],
    };

    const message = {
      patient: patient.address,
      provider: accreditedProvider.address,
      scopeMask: SCOPE_LABS,
      validFrom,
      validUntil,
      nonce: Number(nonce),
      policyHash: samplePolicyHash,
    };

    // Sign with WRONG signer (relayer instead of patient)
    const forgedSig = await relayer.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(forgedSig);

    await expect(
      consentRegistry.connect(relayer).grantConsentWithPermit(
        patient.address,
        accreditedProvider.address,
        SCOPE_LABS,
        validFrom,
        validUntil,
        samplePolicyHash,
        v,
        r,
        s
      )
    ).to.be.revertedWith("ConsentRegistry: invalid signature");
  });

  it("11. Valid EIP-712 permit is accepted and replayed signatures are rejected", async function () {
    const now = await time.latest();
    const validFrom = now;
    const validUntil = now + 48 * 3600;
    const nonce = await consentRegistry.nonces(patient.address);

    const domain = {
      name: "SAATHI Consent Gateway",
      version: "1.0",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: await consentRegistry.getAddress(),
    };

    const types = {
      ConsentPermit: [
        { name: "patient", type: "address" },
        { name: "provider", type: "address" },
        { name: "scopeMask", type: "bytes32" },
        { name: "validFrom", type: "uint256" },
        { name: "validUntil", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "policyHash", type: "bytes32" },
      ],
    };

    const message = {
      patient: patient.address,
      provider: accreditedProvider.address,
      scopeMask: SCOPE_LABS,
      validFrom,
      validUntil,
      nonce: Number(nonce),
      policyHash: samplePolicyHash,
    };

    const validSig = await patient.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(validSig);

    // 1st submission: Success
    await consentRegistry.connect(relayer).grantConsentWithPermit(
      patient.address,
      accreditedProvider.address,
      SCOPE_LABS,
      validFrom,
      validUntil,
      samplePolicyHash,
      v,
      r,
      s
    );

    expect(
      await consentRegistry.hasValidConsent(patient.address, accreditedProvider.address, SCOPE_LABS)
    ).to.be.true;

    // 2nd submission (Replay attack): MUST revert because patient's nonce incremented
    await expect(
      consentRegistry.connect(relayer).grantConsentWithPermit(
        patient.address,
        accreditedProvider.address,
        SCOPE_LABS,
        validFrom,
        validUntil,
        samplePolicyHash,
        v,
        r,
        s
      )
    ).to.be.revertedWith("ConsentRegistry: invalid signature");
  });

  it("12. Permission scopes are strictly enforced", async function () {
    const duration = 24 * 3600;
    // Patient grants ONLY Lab access
    await consentRegistry.connect(patient).grantConsent(
      accreditedProvider.address,
      SCOPE_LABS,
      duration,
      samplePolicyHash
    );

    // LABS scope: Allowed
    expect(
      await consentRegistry.hasValidConsent(patient.address, accreditedProvider.address, SCOPE_LABS)
    ).to.be.true;

    // PRESCRIPTIONS scope: Denied
    expect(
      await consentRegistry.hasValidConsent(patient.address, accreditedProvider.address, SCOPE_PRESCRIPTIONS)
    ).to.be.false;
  });

  it("13. Suspended provider loses access even with unexpired consent", async function () {
    const duration = 48 * 3600;
    await consentRegistry.connect(patient).grantConsent(
      accreditedProvider.address,
      SCOPE_LABS,
      duration,
      samplePolicyHash
    );

    expect(
      await consentRegistry.hasValidConsent(patient.address, accreditedProvider.address, SCOPE_LABS)
    ).to.be.true;

    // Regulator suspends the provider
    await providerRegistry.connect(admin).suspendProvider(accreditedProvider.address, "Breach of protocol");

    // Existing consent is immediately blocked
    expect(
      await consentRegistry.hasValidConsent(patient.address, accreditedProvider.address, SCOPE_LABS)
    ).to.be.false;
  });

  it("14. Emergency break-glass protocol restricted to accredited providers & max 4 hours", async function () {
    const reasonHash = ethers.keccak256(ethers.toUtf8Bytes("TRAUMA_TRIAGE_ICU_ADMISSION"));
    const breakGlassScope = SCOPE_BOTH;

    // Unaccredited cannot trigger emergency
    await expect(
      consentRegistry.connect(unaccreditedProvider).requestEmergencyAccess(
        patient.address,
        reasonHash,
        breakGlassScope,
        3600
      )
    ).to.be.revertedWith("ConsentRegistry: provider not accredited");

    // Cannot exceed 4 hours
    await expect(
      consentRegistry.connect(accreditedProvider).requestEmergencyAccess(
        patient.address,
        reasonHash,
        breakGlassScope,
        5 * 3600
      )
    ).to.be.revertedWith("ConsentRegistry: emergency duration 1s-4h");

    // Accredited triggers valid emergency break-glass
    await consentRegistry.connect(accreditedProvider).requestEmergencyAccess(
      patient.address,
      reasonHash,
      breakGlassScope,
      2 * 3600
    );

    const logs = await consentRegistry.getEmergencyAuditLogs(patient.address);
    expect(logs.length).to.equal(1);
    expect(logs[0].patient).to.equal(patient.address);
    expect(logs[0].provider).to.equal(accreditedProvider.address);
    expect(logs[0].reasonHash).to.equal(reasonHash);
    expect(logs[0].breakGlassScope).to.equal(breakGlassScope);
  });
});
