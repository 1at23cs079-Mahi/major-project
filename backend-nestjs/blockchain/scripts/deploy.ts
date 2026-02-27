import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying Healthcare Blockchain Contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy HealthcareAuditLog
  console.log("📋 Deploying HealthcareAuditLog...");
  const AuditLog = await ethers.getContractFactory("HealthcareAuditLog");
  const auditLog = await AuditLog.deploy();
  await auditLog.waitForDeployment();
  const auditLogAddress = await auditLog.getAddress();
  console.log("✅ HealthcareAuditLog deployed to:", auditLogAddress);

  // Deploy ConsentManager
  console.log("\n🤝 Deploying ConsentManager...");
  const ConsentManager = await ethers.getContractFactory("ConsentManager");
  const consentManager = await ConsentManager.deploy();
  await consentManager.waitForDeployment();
  const consentManagerAddress = await consentManager.getAddress();
  console.log("✅ ConsentManager deployed to:", consentManagerAddress);

  // Deploy PrescriptionRegistry
  console.log("\n💊 Deploying PrescriptionRegistry...");
  const PrescriptionRegistry = await ethers.getContractFactory("PrescriptionRegistry");
  const prescriptionRegistry = await PrescriptionRegistry.deploy();
  await prescriptionRegistry.waitForDeployment();
  const prescriptionRegistryAddress = await prescriptionRegistry.getAddress();
  console.log("✅ PrescriptionRegistry deployed to:", prescriptionRegistryAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      HealthcareAuditLog: {
        address: auditLogAddress,
        abi: "HealthcareAuditLog.json"
      },
      ConsentManager: {
        address: consentManagerAddress,
        abi: "ConsentManager.json"
      },
      PrescriptionRegistry: {
        address: prescriptionRegistryAddress,
        abi: "PrescriptionRegistry.json"
      }
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const filename = `deployment-${deploymentInfo.chainId}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also save as latest
  fs.writeFileSync(
    path.join(deploymentsDir, "latest.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📁 Deployment info saved to:", path.join(deploymentsDir, filename));

  // Generate .env entries
  console.log("\n📝 Add these to your .env file:\n");
  console.log("# Blockchain Configuration");
  console.log(`BLOCKCHAIN_ENABLED=true`);
  console.log(`BLOCKCHAIN_NETWORK=localhost`);
  console.log(`BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545`);
  console.log(`BLOCKCHAIN_CHAIN_ID=${deploymentInfo.chainId}`);
  console.log(`AUDIT_LOG_CONTRACT_ADDRESS=${auditLogAddress}`);
  console.log(`CONSENT_MANAGER_CONTRACT_ADDRESS=${consentManagerAddress}`);
  console.log(`PRESCRIPTION_REGISTRY_CONTRACT_ADDRESS=${prescriptionRegistryAddress}`);
  console.log(`BLOCKCHAIN_PRIVATE_KEY=<your-private-key-from-hardhat-node>`);

  console.log("\n✨ Deployment complete!");

  return deploymentInfo;
}

main()
  .then((info) => {
    console.log("\n🎉 All contracts deployed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
