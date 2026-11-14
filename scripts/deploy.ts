import hre from "hardhat";
const { ethers, network } = hre;
import fs from "fs";
import path from "path";

async function main() {
  console.log("==================================================");
  console.log("   SAATHI — Decentralized Healthcare Identity     ");
  console.log("      Sepolia Smart Contract Deployment           ");
  console.log("==================================================\n");

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.error("Error: No deployer account configured for this network.");
    console.error("To deploy via Hardhat CLI, set DEPLOYER_PRIVATE_KEY in .env.local.");
    console.error("Alternatively, you can deploy using MetaMask via our Browser Deployer or Remix without exposing your private key.");
    process.exit(1);
  }
  const deployer = signers[0];
  const currentNetwork = await ethers.provider.getNetwork();
  const chainId = Number(currentNetwork.chainId);

  console.log(`Deployer Address:    ${deployer.address}`);
  console.log(`Network Name:        ${network.name}`);
  console.log(`Chain ID:            ${chainId}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance:    ${ethers.formatEther(balance)} ETH\n`);

  if (chainId !== 11155111 && network.name === "sepolia") {
    throw new Error(`Chain ID mismatch! Expected 11155111 for Sepolia, got ${chainId}`);
  }

  // 1. Deploy ProviderRegistry
  console.log("1. Deploying ProviderRegistry...");
  const ProviderRegistryFactory = await ethers.getContractFactory("ProviderRegistry");
  const providerRegistry = await ProviderRegistryFactory.deploy();
  await providerRegistry.waitForDeployment();
  const providerRegistryAddress = await providerRegistry.getAddress();
  const providerDeployTx = providerRegistry.deploymentTransaction();

  console.log(`   -> ProviderRegistry deployed at: ${providerRegistryAddress}`);
  console.log(`   -> Transaction Hash:            ${providerDeployTx?.hash}\n`);

  // 2. Deploy ConsentRegistry (dependent on ProviderRegistry)
  console.log("2. Deploying ConsentRegistry...");
  const ConsentRegistryFactory = await ethers.getContractFactory("ConsentRegistry");
  const consentRegistry = await ConsentRegistryFactory.deploy(providerRegistryAddress);
  await consentRegistry.waitForDeployment();
  const consentRegistryAddress = await consentRegistry.getAddress();
  const consentDeployTx = consentRegistry.deploymentTransaction();

  console.log(`   -> ConsentRegistry deployed at:  ${consentRegistryAddress}`);
  console.log(`   -> Transaction Hash:            ${consentDeployTx?.hash}\n`);

  // 3. Deploy CredentialStatusRegistry
  console.log("3. Deploying CredentialStatusRegistry...");
  const CredentialRegistryFactory = await ethers.getContractFactory("CredentialStatusRegistry");
  const credentialRegistry = await CredentialRegistryFactory.deploy();
  await credentialRegistry.waitForDeployment();
  const credentialRegistryAddress = await credentialRegistry.getAddress();
  const credentialDeployTx = credentialRegistry.deploymentTransaction();

  console.log(`   -> CredentialStatusRegistry at: ${credentialRegistryAddress}`);
  console.log(`   -> Transaction Hash:            ${credentialDeployTx?.hash}\n`);

  // 4. Save Deployment JSON
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentRecord = {
    network: network.name,
    chainId: chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ProviderRegistry: {
        address: providerRegistryAddress,
        transactionHash: providerDeployTx?.hash,
        constructorArgs: [],
      },
      ConsentRegistry: {
        address: consentRegistryAddress,
        transactionHash: consentDeployTx?.hash,
        constructorArgs: [providerRegistryAddress],
      },
      CredentialStatusRegistry: {
        address: credentialRegistryAddress,
        transactionHash: credentialDeployTx?.hash,
        constructorArgs: [],
      },
    },
    verificationCommands: {
      ProviderRegistry: `npx hardhat verify --network sepolia ${providerRegistryAddress}`,
      ConsentRegistry: `npx hardhat verify --network sepolia ${consentRegistryAddress} "${providerRegistryAddress}"`,
      CredentialStatusRegistry: `npx hardhat verify --network sepolia ${credentialRegistryAddress}`,
    },
  };

  const deploymentPath = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentRecord, null, 2));
  console.log(`Deployment record saved to: ${deploymentPath}\n`);

  console.log("==================================================");
  console.log("   Etherscan Contract Verification Commands:      ");
  console.log("==================================================");
  console.log(deploymentRecord.verificationCommands.ProviderRegistry);
  console.log(deploymentRecord.verificationCommands.ConsentRegistry);
  console.log(deploymentRecord.verificationCommands.CredentialStatusRegistry);
  console.log("==================================================\n");

  console.log("Next Step: Configure your .env.local with these deployed addresses:");
  console.log(`NEXT_PUBLIC_PROVIDER_REGISTRY_ADDRESS=${providerRegistryAddress}`);
  console.log(`NEXT_PUBLIC_CONSENT_REGISTRY_ADDRESS=${consentRegistryAddress}`);
  console.log(`NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS=${credentialRegistryAddress}\n`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
