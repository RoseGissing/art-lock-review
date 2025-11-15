import { ethers } from "hardhat";
import { ArtLockReview__factory, ArtworkRating__factory } from "../types";

async function deployProduction() {
  console.log("🚀 Starting production deployment...");

  const [deployer] = await ethers.getSigners();
  console.log(`📤 Deploying from: ${deployer.address}`);
  console.log(`💰 Deployer balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

  // Deploy ArtLockReview contract
  console.log("📄 Deploying ArtLockReview contract...");
  const artLockReviewFactory = (await ethers.getContractFactory("ArtLockReview")) as ArtLockReview__factory;
  const artLockReview = await artLockReviewFactory.deploy();

  console.log("⏳ Waiting for ArtLockReview deployment...");
  await artLockReview.waitForDeployment();
  const artLockReviewAddress = await artLockReview.getAddress();
  console.log(`✅ ArtLockReview deployed at: ${artLockReviewAddress}`);

  // Deploy ArtworkRating contract
  console.log("📄 Deploying ArtworkRating contract...");
  const artworkRatingFactory = (await ethers.getContractFactory("ArtworkRating")) as ArtworkRating__factory;
  const artworkRating = await artworkRatingFactory.deploy();

  console.log("⏳ Waiting for ArtworkRating deployment...");
  await artworkRating.waitForDeployment();
  const artworkRatingAddress = await artworkRating.getAddress();
  console.log(`✅ ArtworkRating deployed at: ${artworkRatingAddress}`);

  // Verify contracts on Etherscan (if on mainnet)
  const network = await ethers.provider.getNetwork();
  if (network.name === 'mainnet') {
    console.log("🔍 Verifying contracts on Etherscan...");
    try {
      await run("verify:verify", {
        address: artLockReviewAddress,
        constructorArguments: [],
      });
      console.log("✅ ArtLockReview verified");

      await run("verify:verify", {
        address: artworkRatingAddress,
        constructorArguments: [],
      });
      console.log("✅ ArtworkRating verified");
    } catch (error) {
      console.warn("⚠️  Contract verification failed:", error);
    }
  }

  // Generate deployment summary
  const deploymentSummary = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    contracts: {
      ArtLockReview: artLockReviewAddress,
      ArtworkRating: artworkRatingAddress,
    },
    timestamp: new Date().toISOString(),
    gasPrice: ethers.formatUnits(await ethers.provider.getFeeData().gasPrice || 0, 'gwei'),
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentSummary, null, 2));

  // Save deployment info
  const fs = require('fs');
  const deploymentPath = `deployments/${network.name}/production.json`;
  fs.mkdirSync(`deployments/${network.name}`, { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentSummary, null, 2));

  console.log(`💾 Deployment info saved to: ${deploymentPath}`);
  console.log("\n🎉 Production deployment completed successfully!");
}

deployProduction()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Production deployment failed:", error);
    process.exit(1);
  });
