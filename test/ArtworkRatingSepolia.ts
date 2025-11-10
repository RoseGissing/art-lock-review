import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { ArtworkRating } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  artist: HardhatEthersSigner;
  judge1: HardhatEthersSigner;
  judge2: HardhatEthersSigner;
};

describe("ArtworkRatingSepolia", function () {
  let signers: Signers;
  let artworkRatingContract: ArtworkRating;
  let artworkRatingContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const ArtworkRatingDeployment = await deployments.get("ArtworkRating");
      artworkRatingContractAddress = ArtworkRatingDeployment.address;
      artworkRatingContract = await ethers.getContractAt(
        "ArtworkRating",
        ArtworkRatingDeployment.address
      );
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      artist: ethSigners[0],
      judge1: ethSigners[1],
      judge2: ethSigners[2],
    };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should create artwork and submit ratings", async function () {
    steps = 15;
    this.timeout(4 * 40000);

    progress("Creating artwork...");
    let tx = await artworkRatingContract
      .connect(signers.artist)
      .createArtwork("Sepolia Test Artwork");
    await tx.wait();

    const artworkId = 0;

    progress("Encrypting score 8...");
    const encryptedScore1 = await fhevm
      .createEncryptedInput(artworkRatingContractAddress, signers.judge1.address)
      .add32(8)
      .encrypt();

    progress(`Submitting rating from judge1...`);
    tx = await artworkRatingContract
      .connect(signers.judge1)
      .submitRating(artworkId, encryptedScore1.handles[0], encryptedScore1.inputProof);
    await tx.wait();

    progress("Encrypting score 6...");
    const encryptedScore2 = await fhevm
      .createEncryptedInput(artworkRatingContractAddress, signers.judge2.address)
      .add32(6)
      .encrypt();

    progress(`Submitting rating from judge2...`);
    tx = await artworkRatingContract
      .connect(signers.judge2)
      .submitRating(artworkId, encryptedScore2.handles[0], encryptedScore2.inputProof);
    await tx.wait();

    progress("Getting artwork info...");
    const [, , ratingCount] = await artworkRatingContract.getArtworkInfo(artworkId);
    expect(ratingCount).to.eq(2);

    progress("Getting encrypted total score...");
    const encryptedTotal = await artworkRatingContract.getEncryptedTotalScore(artworkId);

    progress("Getting encrypted count...");
    const encryptedCount = await artworkRatingContract.getEncryptedCount(artworkId);

    progress("Decrypting total score...");
    const clearTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotal,
      artworkRatingContractAddress,
      signers.judge1,
    );
    progress(`Clear total score: ${clearTotal}`);

    progress("Decrypting count...");
    const clearCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCount,
      artworkRatingContractAddress,
      signers.judge1,
    );
    progress(`Clear count: ${clearCount}`);

    expect(clearTotal).to.eq(14); // 8 + 6
    expect(clearCount).to.eq(2);
  });
});

