import { ethers, fhevm } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const artist = signers[0];
  const judge = signers[1]; // Use second account as judge
  
  // Get deployed contract
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const ArtworkRating = await ethers.getContractAt("ArtworkRating", contractAddress);
  
  console.log("Testing rating submission...");
  console.log("Artist address:", artist.address);
  console.log("Judge address:", judge.address);
  
  // Check artwork count
  const artworkCount = await ArtworkRating.getArtworkCount();
  console.log("Current artwork count:", artworkCount.toString());
  
  // Create artwork if none exists
  if (artworkCount === 0n) {
    console.log("Creating artwork...");
    const tx = await ArtworkRating.connect(artist).createArtwork("Test Artwork");
    await tx.wait();
    console.log("Artwork created!");
  }
  
  // Check artwork info
  const [title, artworkArtist, ratingCount] = await ArtworkRating.getArtworkInfo(0);
  console.log("Artwork 0:", { title, artist: artworkArtist, ratingCount: ratingCount.toString() });
  
  // Check if already rated
  const hasRated = await ArtworkRating.hasRated(0, judge.address);
  if (hasRated) {
    console.log("Judge has already rated this artwork");
  } else {
    // Submit encrypted rating
    const score = 8;
    console.log("Encrypting score:", score);
    
    const encryptedScore = await fhevm
      .createEncryptedInput(contractAddress, judge.address)
      .add32(score)
      .encrypt();
    
    console.log("Encrypted handle:", encryptedScore.handles[0]);
    console.log("Input proof length:", encryptedScore.inputProof.length);
    
    console.log("Submitting rating...");
    const tx = await ArtworkRating.connect(judge).submitRating(
      0,
      encryptedScore.handles[0],
      encryptedScore.inputProof
    );
    await tx.wait();
    
    console.log("Rating submitted successfully!");
  }
  
  // Verify
  const [, , newRatingCount] = await ArtworkRating.getArtworkInfo(0);
  console.log("Rating count:", newRatingCount.toString());
  
  console.log("\n✅ All done! You can now test the frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
