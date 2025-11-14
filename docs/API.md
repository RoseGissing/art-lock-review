# ArtLockReview API Documentation

## Overview

ArtLockReview provides a comprehensive API for interacting with the decentralized art review platform. All operations are secured using Fully Homomorphic Encryption (FHE) to maintain privacy.

## Smart Contract Functions

### Core Functions

#### `createArtwork(string title, string description)`

Creates a new artwork for review.

**Parameters:**
- `title`: Artwork title
- `description`: Artwork description

**Returns:** `uint256` - The artwork ID

**Requirements:** Caller must be an artist

---

#### `submitReview(uint256 artworkId, externalEuint32 encryptedRating, bytes inputProof, string encryptedComment)`

Submits an encrypted review for an artwork.

**Parameters:**
- `artworkId`: ID of the artwork to review
- `encryptedRating`: FHE-encrypted rating (1-10 scale)
- `inputProof`: FHE input proof
- `encryptedComment`: IPFS hash of encrypted comment

**Requirements:** Caller must be a reviewer

---

#### `batchSubmitReviews(uint256[] artworkIds, externalEuint32[] encryptedRatings, bytes[] inputProofs, string[] encryptedComments)`

Submits multiple encrypted reviews in a single transaction.

**Parameters:**
- `artworkIds`: Array of artwork IDs
- `encryptedRatings`: Array of FHE-encrypted ratings
- `inputProofs`: Array of FHE input proofs
- `encryptedComments`: Array of encrypted comment hashes

**Requirements:** Caller must be a reviewer, max 10 reviews per batch

---

### Token Functions

#### `mintArtwork(uint256 artworkId, address to)`

Mints an NFT token for an artwork.

**Parameters:**
- `artworkId`: ID of the artwork
- `to`: Address to receive the token

**Returns:** `uint256` - The token ID

---

#### `transfer(address to, uint256 tokenId)`

Transfers an NFT token.

**Parameters:**
- `to`: Recipient address
- `tokenId`: Token ID to transfer

---

### Multi-Signature Functions

#### `submitTransaction(address destination, uint256 value, bytes data)`

Submits a transaction for multi-signature approval.

**Parameters:**
- `destination`: Target contract address
- `value`: ETH value to send
- `data`: Transaction data

**Returns:** `bytes32` - Transaction hash

---

#### `confirmTransaction(bytes32 txHash)`

Confirms a pending multi-signature transaction.

**Parameters:**
- `txHash`: Transaction hash to confirm

---

### View Functions

#### `getArtwork(uint256 artworkId)`

Retrieves artwork metadata.

**Returns:** `(string title, string description, address artist, uint256 createdAt, bool isActive, uint256 totalReviews)`

---

#### `getEncryptedAverageScore(uint256 artworkId)`

Gets the encrypted average score for an artwork.

**Returns:** `euint32` - Encrypted average score

---

#### `getLeaderboard()`

Returns the current leaderboard.

**Returns:** `LeaderboardEntry[]` - Array of leaderboard entries

---

## Events

### `ArtworkCreated(uint256 indexed artworkId, address indexed artist, string title)`

Emitted when a new artwork is created.

### `ReviewSubmitted(uint256 indexed artworkId, address indexed reviewer)`

Emitted when a review is submitted.

### `Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`

Emitted when an NFT is transferred.

### `AuctionCreated(uint256 auctionId, uint256 artworkId, address seller, uint256 startingPrice, uint256 endTime)`

Emitted when an auction is created.

## Error Codes

- `Not the owner`: Operation requires owner privileges
- `Not a reviewer/artist`: Operation requires specific role
- `Artwork not active`: Artwork is not available for operations
- `Insufficient contract balance`: Contract lacks funds for operation
- `Token already exists`: NFT token ID already in use

## Gas Optimization Tips

1. Use `batchSubmitReviews` for multiple reviews to save gas
2. Call `updateLeaderboard` during low-traffic periods
3. Batch token operations when possible
4. Monitor contract balance to avoid failed transactions

## Security Considerations

- All sensitive data is encrypted using FHE
- Multi-signature requirements for critical operations
- Access control enforced at contract level
- Input validation on all public functions
- Reentrancy protection on state-changing operations
