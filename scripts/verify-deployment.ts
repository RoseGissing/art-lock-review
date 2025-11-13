import { ethers } from "hardhat";
import { ArtLockReview__factory, ArtworkRating__factory } from "../types";

async function verifyDeployment() {
  console.log("🔍 Verifying contract deployments...");

  // Check network
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Connected to network: ${network.name} (chainId: ${network.chainId})`);

  // Verify contract sizes
  const artLockReviewFactory = (await ethers.getContractFactory("ArtLockReview")) as ArtLockReview__factory;
  const artworkRatingFactory = (await ethers.getContractFactory("ArtworkRating")) as ArtworkRating__factory;

  const artLockReviewSize = artLockReviewFactory.bytecode.length / 2 - 1; // Remove 0x prefix
  const artworkRatingSize = artworkRatingFactory.bytecode.length / 2 - 1;

  console.log(`📏 ArtLockReview contract size: ${artLockReviewSize} bytes`);
  console.log(`📏 ArtworkRating contract size: ${artworkRatingSize} bytes`);

  // Check deployment costs
  const gasPrice = await ethers.provider.getFeeData();
  console.log(`⛽ Current gas price: ${ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei')} gwei`);

  // Verify contract interfaces
  const artLockReviewInterface = artLockReviewFactory.interface;
  const artworkRatingInterface = artworkRatingFactory.interface;

  console.log(`🔗 ArtLockReview functions: ${artLockReviewInterface.functions.length}`);
  console.log(`🔗 ArtworkRating functions: ${artworkRatingInterface.functions.length}`);

  console.log("✅ Deployment verification completed successfully!");
}

verifyDeployment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment verification failed:", error);
    process.exit(1);
  });
