import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { ProviderRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ProviderRegistry", function () {
  let providerRegistry: ProviderRegistry;
  let admin: SignerWithAddress;
  let provider1: SignerWithAddress;
  let provider2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const sampleMetadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://QmVerifiableAccreditation1"));

  beforeEach(async function () {
    [admin, provider1, provider2, unauthorized] = await ethers.getSigners();

    const ProviderRegistryFactory = await ethers.getContractFactory("ProviderRegistry");
    providerRegistry = await ProviderRegistryFactory.deploy();
    await providerRegistry.waitForDeployment();

    // Provider 1 self-registers
    await providerRegistry.connect(provider1).registerProvider(
      "NMC-REG-2024-8841",
      "Apollo Multispeciality Hospitals",
      "National Health Authority (IN)",
      sampleMetadataHash
    );
  });

  it("1. Admin can accredit a provider", async function () {
    const oneYear = 365 * 24 * 3600;
    const tx = await providerRegistry.connect(admin).accreditProvider(provider1.address, oneYear);
    await tx.wait();

    const isAccredited = await providerRegistry.isProviderAccredited(provider1.address);
    expect(isAccredited).to.be.true;

    const info = await providerRegistry.getProvider(provider1.address);
    expect(info.organizationName).to.equal("Apollo Multispeciality Hospitals");
    expect(info.status).to.equal(2); // Accredited
    expect(info.validUntil).to.be.greaterThan(0);
  });

  it("2. Unauthorized user cannot accredit", async function () {
    const oneYear = 365 * 24 * 3600;
    await expect(
      providerRegistry.connect(unauthorized).accreditProvider(provider1.address, oneYear)
    ).to.be.revertedWithCustomError(providerRegistry, "OwnableUnauthorizedAccount");
  });

  it("3. Admin can suspend a provider", async function () {
    const oneYear = 365 * 24 * 3600;
    await providerRegistry.connect(admin).accreditProvider(provider1.address, oneYear);
    expect(await providerRegistry.isProviderAccredited(provider1.address)).to.be.true;

    await providerRegistry.connect(admin).suspendProvider(provider1.address, "Routine compliance audit pending");

    const isAccreditedAfterSuspend = await providerRegistry.isProviderAccredited(provider1.address);
    expect(isAccreditedAfterSuspend).to.be.false;

    const info = await providerRegistry.getProvider(provider1.address);
    expect(info.status).to.equal(3); // Suspended
  });

  it("4. Suspended providers cannot receive new permissions and report as unaccredited", async function () {
    const oneYear = 365 * 24 * 3600;
    await providerRegistry.connect(admin).accreditProvider(provider1.address, oneYear);
    await providerRegistry.connect(admin).suspendProvider(provider1.address, "Audit fail");

    expect(await providerRegistry.isProviderAccredited(provider1.address)).to.be.false;
  });

  it("5. Admin can reactivate a suspended provider", async function () {
    const oneYear = 365 * 24 * 3600;
    await providerRegistry.connect(admin).accreditProvider(provider1.address, oneYear);
    await providerRegistry.connect(admin).suspendProvider(provider1.address, "Temporary maintenance");
    expect(await providerRegistry.isProviderAccredited(provider1.address)).to.be.false;

    await providerRegistry.connect(admin).reactivateProvider(provider1.address);
    expect(await providerRegistry.isProviderAccredited(provider1.address)).to.be.true;
  });

  it("6. Admin can permanently revoke a provider", async function () {
    const oneYear = 365 * 24 * 3600;
    await providerRegistry.connect(admin).accreditProvider(provider1.address, oneYear);
    await providerRegistry.connect(admin).revokeProvider(provider1.address, "Malpractice findings");

    expect(await providerRegistry.isProviderAccredited(provider1.address)).to.be.false;

    const info = await providerRegistry.getProvider(provider1.address);
    expect(info.status).to.equal(4); // Revoked

    // Cannot re-accredit a revoked provider
    await expect(
      providerRegistry.connect(admin).accreditProvider(provider1.address, oneYear)
    ).to.be.revertedWith("ProviderRegistry: provider permanently revoked");
  });
});
