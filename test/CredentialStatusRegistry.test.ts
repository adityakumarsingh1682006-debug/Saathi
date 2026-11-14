import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { CredentialStatusRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CredentialStatusRegistry", function () {
  let credentialRegistry: CredentialStatusRegistry;
  let issuer: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const sampleCredentialHash = ethers.keccak256(ethers.toUtf8Bytes("W3C_VC_ABHA_LEVEL3_ATTESTATION_DIGEST"));
  const sampleRevocationReason = ethers.keccak256(ethers.toUtf8Bytes("PROVIDER_ACCREDITATION_EXPIRED"));

  beforeEach(async function () {
    [issuer, unauthorized] = await ethers.getSigners();

    const CredentialStatusRegistryFactory = await ethers.getContractFactory("CredentialStatusRegistry");
    credentialRegistry = await CredentialStatusRegistryFactory.deploy();
    await credentialRegistry.waitForDeployment();
  });

  it("13. Valid credential hashes can be anchored", async function () {
    const oneYear = 365 * 24 * 3600;
    const tx = await credentialRegistry.connect(issuer).anchorCredential(sampleCredentialHash, oneYear);
    await tx.wait();

    const [state, recordIssuer, issuedAt, validUntil] = await credentialRegistry.checkCredentialStatus(
      sampleCredentialHash
    );

    expect(state).to.equal(1); // Valid
    expect(recordIssuer).to.equal(issuer.address);
    expect(issuedAt).to.be.greaterThan(0);
    expect(validUntil).to.be.greaterThan(issuedAt);
  });

  it("14. Credential issuer can revoke their credential", async function () {
    const oneYear = 365 * 24 * 3600;
    await credentialRegistry.connect(issuer).anchorCredential(sampleCredentialHash, oneYear);

    await credentialRegistry.connect(issuer).revokeCredential(sampleCredentialHash, sampleRevocationReason);

    const [state] = await credentialRegistry.checkCredentialStatus(sampleCredentialHash);
    expect(state).to.equal(2); // Revoked
  });

  it("15. Unauthorized wallets cannot revoke another issuer's credential", async function () {
    const oneYear = 365 * 24 * 3600;
    await credentialRegistry.connect(issuer).anchorCredential(sampleCredentialHash, oneYear);

    await expect(
      credentialRegistry.connect(unauthorized).revokeCredential(sampleCredentialHash, sampleRevocationReason)
    ).to.be.revertedWith("CredentialRegistry: only issuer can revoke");
  });

  it("16. Revoked credentials fail verification", async function () {
    const oneYear = 365 * 24 * 3600;
    await credentialRegistry.connect(issuer).anchorCredential(sampleCredentialHash, oneYear);
    await credentialRegistry.connect(issuer).revokeCredential(sampleCredentialHash, sampleRevocationReason);

    const [state] = await credentialRegistry.checkCredentialStatus(sampleCredentialHash);
    expect(state).to.not.equal(1); // Not Valid
    expect(state).to.equal(2); // Revoked
  });

  it("17. Expired credentials dynamically transition to Suspended/Expired status", async function () {
    const duration = 3600; // 1 hour
    await credentialRegistry.connect(issuer).anchorCredential(sampleCredentialHash, duration);

    // Initial check: Valid
    const [stateBefore] = await credentialRegistry.checkCredentialStatus(sampleCredentialHash);
    expect(stateBefore).to.equal(1); // Valid

    // Fast forward past expiration
    await time.increase(3601);

    const [stateAfter] = await credentialRegistry.checkCredentialStatus(sampleCredentialHash);
    expect(stateAfter).to.equal(3); // Suspended (expired)
  });

  it("18. Duplicate credential hashes cannot be anchored", async function () {
    await credentialRegistry.connect(issuer).anchorCredential(sampleCredentialHash, 3600);

    await expect(
      credentialRegistry.connect(issuer).anchorCredential(sampleCredentialHash, 3600)
    ).to.be.revertedWith("CredentialRegistry: already exists");
  });
});
