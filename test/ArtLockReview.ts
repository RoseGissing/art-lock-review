import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ArtLockReview, ArtLockReview__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  artist: HardhatEthersSigner;
  reviewer1: HardhatEthersSigner;
  reviewer2: HardhatEthersSigner;
  reviewer3: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ArtLockReview")) as ArtLockReview__factory;
  const artLockReviewContract = (await factory.deploy()) as ArtLockReview;
  const artLockReviewContractAddress = await artLockReviewContract.getAddress();

  return { artLockReviewContract, artLockReviewContractAddress };
}

describe("ArtLockReview", function () {
  let signers: Signers;
  let artLockReviewContract: ArtLockReview;
  let artLockReviewContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      artist: ethSigners[1],
      reviewer1: ethSigners[2],
      reviewer2: ethSigners[3],
      reviewer3: ethSigners[4],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ artLockReviewContract, artLockReviewContractAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("should set the correct owner", async function () {
      const owner = await artLockReviewContract.getOwner();
      expect(owner).to.equal(signers.deployer.address);
    });

    it("should initialize default roles", async function () {
      expect(await artLockReviewContract.checkArtist(signers.deployer.address)).to.be.true;
      expect(await artLockReviewContract.checkReviewer(signers.deployer.address)).to.be.true;
    });
  });

  describe("Role Management", function () {
    it("should allow owner to add reviewers", async function () {
      await artLockReviewContract.addReviewer(signers.reviewer1.address);
      expect(await artLockReviewContract.checkReviewer(signers.reviewer1.address)).to.be.true;
    });

    it("should allow owner to add artists", async function () {
      await artLockReviewContract.addArtist(signers.artist.address);
      expect(await artLockReviewContract.checkArtist(signers.artist.address)).to.be.true;
    });

    it("should not allow non-owners to add roles", async function () {
      await expect(
        artLockReviewContract.connect(signers.reviewer1).addReviewer(signers.reviewer2.address)
      ).to.be.revertedWith("Not the owner");
    });
  });

  describe("Artwork Management", function () {
    beforeEach(async function () {
      await artLockReviewContract.addArtist(signers.artist.address);
      await artLockReviewContract.addReviewer(signers.reviewer1.address);
    });

    it("should allow artists to create artworks", async function () {
      const tx = await artLockReviewContract.connect(signers.artist).createArtwork("Test Artwork", "A test description");
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const artworkId = 0; // First artwork
      const artwork = await artLockReviewContract.getArtwork(artworkId);
      expect(artwork.title).to.equal("Test Artwork");
      expect(artwork.description).to.equal("A test description");
      expect(artwork.artist).to.equal(signers.artist.address);
    });

    it("should not allow non-artists to create artworks", async function () {
      await expect(
        artLockReviewContract.connect(signers.reviewer1).createArtwork("Test", "Description")
      ).to.be.revertedWith("Not an artist");
    });
  });

  describe("Review System", function () {
    let artworkId: number;

    beforeEach(async function () {
      await artLockReviewContract.addArtist(signers.artist.address);
      await artLockReviewContract.addReviewer(signers.reviewer1.address);

      const tx = await artLockReviewContract.connect(signers.artist).createArtwork("Test Artwork", "Description");
      await tx.wait();
      artworkId = 0;
    });

    it("should allow reviewers to submit encrypted ratings", async function () {
      // Fund the contract for review fees
      await signers.deployer.sendTransaction({
        to: artLockReviewContractAddress,
        value: ethers.parseEther("1.0")
      });

      const rating = 8;
      const encryptedRating = await fhevm.encrypt8(rating);

      const tx = await artLockReviewContract.connect(signers.reviewer1).submitReview(
        artworkId,
        encryptedRating,
        "0x", // inputProof - simplified for test
        "ipfs://encrypted-comment-hash"
      );
      await tx.wait();

      expect(await artLockReviewContract.getArtworkReviewCount(artworkId)).to.equal(1);
    });

    it("should reject reviews from non-reviewers", async function () {
      const rating = 7;
      const encryptedRating = await fhevm.encrypt8(rating);

      await expect(
        artLockReviewContract.connect(signers.artist).submitReview(
          artworkId,
          encryptedRating,
          "0x",
          "ipfs://comment"
        )
      ).to.be.revertedWith("Not a reviewer");
    });
  });

  describe("Token Functionality", function () {
    let artworkId: number;

    beforeEach(async function () {
      await artLockReviewContract.addArtist(signers.artist.address);
      const tx = await artLockReviewContract.connect(signers.artist).createArtwork("Test Artwork", "Description");
      await tx.wait();
      artworkId = 0;
    });

    it("should allow minting artwork tokens", async function () {
      const tokenId = await artLockReviewContract.connect(signers.artist).mintArtwork(artworkId, signers.artist.address);
      expect(await artLockReviewContract.ownerOf(tokenId)).to.equal(signers.artist.address);
    });

    it("should handle token transfers correctly", async function () {
      const tokenId = await artLockReviewContract.connect(signers.artist).mintArtwork(artworkId, signers.artist.address);
      await artLockReviewContract.connect(signers.artist).transfer(signers.reviewer1.address, tokenId);

      expect(await artLockReviewContract.ownerOf(tokenId)).to.equal(signers.reviewer1.address);
      expect(await artLockReviewContract.balanceOf(signers.artist.address)).to.equal(0);
      expect(await artLockReviewContract.balanceOf(signers.reviewer1.address)).to.equal(1);
    });
  });
});
