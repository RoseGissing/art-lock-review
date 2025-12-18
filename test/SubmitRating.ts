import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("Submit Rating to Deployed Contract", function () {
  it("should submit multiple ratings and decrypt", async function () {
    if (!fhevm.isMock) {
      console.warn("Skipping - not in mock mode");
      this.skip();
    }

    const signers: HardhatEthersSigner[] = await ethers.getSigners();
    const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const ArtworkRating = await ethers.getContractAt("ArtworkRating", contractAddress);
    
    // Submit ratings from multiple judges
    const judges = [signers[3], signers[4], signers[5]];
    const scores = [8, 9, 6];
    
    for (let i = 0; i < judges.length; i++) {
      const judge = judges[i];
      const score = scores[i];
      
      const hasRated = await ArtworkRating.hasRated(0, judge.address);
      if (hasRated) {
        console.log(`Judge ${i + 3} already rated`);
        continue;
      }
      
      console.log(`Judge ${i + 3} submitting score: ${score}`);
      
      const encryptedScore = await fhevm
        .createEncryptedInput(contractAddress, judge.address)
        .add32(score)
        .encrypt();
      
      const tx = await ArtworkRating.connect(judge).submitRating(
        0,
        encryptedScore.handles[0],
        encryptedScore.inputProof
      );
      await tx.wait();
      console.log(`Judge ${i + 3} rating submitted!`);
    }
    
    // Check final rating count
    const [title, artist, ratingCount] = await ArtworkRating.getArtworkInfo(0);
    console.log("\nArtwork info:", { title, artist, ratingCount: ratingCount.toString() });
    
    // Request decryption access and decrypt
    const decryptor = signers[3];
    console.log("\nRequesting decryption access...");
    await ArtworkRating.connect(decryptor).requestDecryptionAccess(0);
    
    const encryptedTotal = await ArtworkRating.getEncryptedTotalScore(0);
    const encryptedCount = await ArtworkRating.getEncryptedCount(0);
    
    console.log("Decrypting...");
    const clearTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotal,
      contractAddress,
      decryptor,
    );
    
    const clearCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCount,
      contractAddress,
      decryptor,
    );
    
    console.log("\n✅ Decrypted values:");
    console.log("Total score:", clearTotal);
    console.log("Rating count:", clearCount);
    console.log("Average:", (Number(clearTotal) / Number(clearCount)).toFixed(2));
  });
});
