import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ArtworkRating, ArtworkRating__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  artist: HardhatEthersSigner;
  judge1: HardhatEthersSigner;
  judge2: HardhatEthersSigner;
  judge3: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ArtworkRating")) as ArtworkRating__factory;
  const artworkRatingContract = (await factory.deploy()) as ArtworkRating;
  const artworkRatingContractAddress = await artworkRatingContract.getAddress();

  return { artworkRatingContract, artworkRatingContractAddress };
}

describe("ArtworkRating", function () {
  let signers: Signers;
  let artworkRatingContract: ArtworkRating;
  let artworkRatingContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      artist: ethSigners[1],
      judge1: ethSigners[2],
      judge2: ethSigners[3],
      judge3: ethSigners[4],
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ artworkRatingContract, artworkRatingContractAddress } = await deployFixture());
  });

  it("should create an artwork", async function () {
    const tx = await artworkRatingContract
      .connect(signers.artist)
      .createArtwork("Test Artwork");
    await tx.wait();

    const [title, artist, ratingCount] = await artworkRatingContract.getArtworkInfo(0);
    expect(title).to.eq("Test Artwork");
    expect(artist).to.eq(signers.artist.address);
    expect(ratingCount).to.eq(0);
  });

  it("should submit encrypted ratings and calculate average", async function () {
    // Create artwork
    let tx = await artworkRatingContract
      .connect(signers.artist)
      .createArtwork("Rated Artwork");
    await tx.wait();

    const artworkId = 0;

    // Judge 1 submits rating of 8
    const score1 = 8;
    const encryptedScore1 = await fhevm
      .createEncryptedInput(artworkRatingContractAddress, signers.judge1.address)
      .add32(score1)
      .encrypt();

    tx = await artworkRatingContract
      .connect(signers.judge1)
      .submitRating(artworkId, encryptedScore1.handles[0], encryptedScore1.inputProof);
    await tx.wait();

    // Judge 2 submits rating of 6
    const score2 = 6;
    const encryptedScore2 = await fhevm
      .createEncryptedInput(artworkRatingContractAddress, signers.judge2.address)
      .add32(score2)
      .encrypt();

    tx = await artworkRatingContract
      .connect(signers.judge2)
      .submitRating(artworkId, encryptedScore2.handles[0], encryptedScore2.inputProof);
    await tx.wait();

    // Judge 3 submits rating of 9
    const score3 = 9;
    const encryptedScore3 = await fhevm
      .createEncryptedInput(artworkRatingContractAddress, signers.judge3.address)
      .add32(score3)
      .encrypt();

    tx = await artworkRatingContract
      .connect(signers.judge3)
      .submitRating(artworkId, encryptedScore3.handles[0], encryptedScore3.inputProof);
    await tx.wait();

    // Verify rating count
    const [, , ratingCount] = await artworkRatingContract.getArtworkInfo(artworkId);
    expect(ratingCount).to.eq(3);

    // Request decryption access first
    await artworkRatingContract.connect(signers.judge1).requestDecryptionAccess(artworkId);

    // Get encrypted total and count
    const encryptedTotal = await artworkRatingContract.getEncryptedTotalScore(artworkId);
    const encryptedCount = await artworkRatingContract.getEncryptedCount(artworkId);

    // Decrypt total and count (any judge can decrypt)
    const clearTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotal,
      artworkRatingContractAddress,
      signers.judge1,
    );

    const clearCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCount,
      artworkRatingContractAddress,
      signers.judge1,
    );

    // Verify calculations
    expect(clearTotal).to.eq(score1 + score2 + score3); // 8 + 6 + 9 = 23
    expect(clearCount).to.eq(3);

    // Calculate average: 23 / 3 = 7.67 (rounded to 7 in integer division)
    // Note: In real scenario, we'd need to handle division differently
    // For MVP, we can decrypt total and count separately and calculate average client-side
  });

  it("should prevent duplicate ratings from same judge", async function () {
    // Create artwork
    let tx = await artworkRatingContract
      .connect(signers.artist)
      .createArtwork("Single Rating Artwork");
    await tx.wait();

    const artworkId = 0;

    // Judge 1 submits first rating
    const score = 7;
    const encryptedScore = await fhevm
      .createEncryptedInput(artworkRatingContractAddress, signers.judge1.address)
      .add32(score)
      .encrypt();

    tx = await artworkRatingContract
      .connect(signers.judge1)
      .submitRating(artworkId, encryptedScore.handles[0], encryptedScore.inputProof);
    await tx.wait();

    // Try to submit again - should fail
    const encryptedScore2 = await fhevm
      .createEncryptedInput(artworkRatingContractAddress, signers.judge1.address)
      .add32(5)
      .encrypt();

    await expect(
      artworkRatingContract
        .connect(signers.judge1)
        .submitRating(artworkId, encryptedScore2.handles[0], encryptedScore2.inputProof)
    ).to.be.revertedWith("Already rated this artwork");
  });

  it("should return correct hasRated status", async function () {
    // Create artwork
    let tx = await artworkRatingContract
      .connect(signers.artist)
      .createArtwork("Has Rated Test");
    await tx.wait();

    const artworkId = 0;

    // Check before rating
    expect(await artworkRatingContract.hasRated(artworkId, signers.judge1.address)).to.be.false;

    // Submit rating
    const score = 8;
    const encryptedScore = await fhevm
      .createEncryptedInput(artworkRatingContractAddress, signers.judge1.address)
      .add32(score)
      .encrypt();

    tx = await artworkRatingContract
      .connect(signers.judge1)
      .submitRating(artworkId, encryptedScore.handles[0], encryptedScore.inputProof);
    await tx.wait();

    // Check after rating
    expect(await artworkRatingContract.hasRated(artworkId, signers.judge1.address)).to.be.true;
    expect(await artworkRatingContract.hasRated(artworkId, signers.judge2.address)).to.be.false;
  });
});

