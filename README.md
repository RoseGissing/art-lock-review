# ArtLockReview - Decentralized Art Review Platform with Privacy

**ArtLockReview** is a revolutionary decentralized platform that brings privacy-preserving art reviews to Web3. Built with FHEVM (Fully Homomorphic Encryption Virtual Machine), it enables anonymous artwork ratings where individual scores remain completely private while aggregated statistics can be computed and displayed.

## 🎯 Core Mission

To create a trustless, privacy-first ecosystem where artists receive honest feedback through encrypted reviews, reviewers maintain anonymity, and the platform ensures fair compensation through blockchain technology.

## 🌟 Key Features

### 🔐 Privacy-Preserving Reviews
- **Fully Homomorphic Encryption**: Individual ratings are encrypted and never decrypted
- **Anonymous Submissions**: Reviewers can submit feedback without revealing identity
- **Aggregated Insights**: Only statistical data (averages, counts) are visible to artists

### 🎨 Comprehensive Art Platform
- **Artist Dashboard**: Manage artworks, view analytics, track engagement
- **Reviewer Portal**: Access pending reviews, maintain reputation scores
- **Gallery View**: Browse artworks with filtering and sorting options

### 🔒 Enhanced Security
- **Multi-Signature Governance**: Critical operations require multiple approvals
- **Upgradeable Contracts**: Future-proof architecture with UUPS proxy pattern
- **Access Control**: Role-based permissions for artists and reviewers

### 💰 Economic Incentives
- **Reviewer Compensation**: Earn tokens for quality reviews
- **Artist Rewards**: Benefit from platform growth and visibility
- **Staking Mechanisms**: Reputation-based staking for enhanced trust

### 📊 Advanced Analytics
- **Real-time Statistics**: Live dashboard with review metrics
- **Leaderboard System**: Top-rated artworks and most active reviewers
- **Trend Analysis**: Historical data and performance insights

## 🏗️ Technical Architecture

### Smart Contracts (Solidity)
```
contracts/
├── ArtLockReview.sol          # Main platform contract
├── ArtworkRating.sol          # Legacy rating system
└── FHECounter.sol            # FHE utility contract
```

### Frontend (React + TypeScript)
```
ui/src/
├── components/                # Reusable UI components
│   ├── ArtistDashboard.tsx    # Artist management interface
│   ├── ReviewerDashboard.tsx  # Reviewer workspace
│   ├── ArtworkGallery.tsx     # Gallery browsing
│   └── EncryptedRatingInput.tsx # FHE rating submission
├── hooks/                     # Custom React hooks
│   ├── useWalletConnection.ts # Wallet integration
│   ├── useArtworkReview.ts    # Review management
│   └── useNotifications.ts    # Notification system
└── lib/                       # Utilities and stores
    └── artworkStore.ts        # State management
```

### Key Technologies
- **FHEVM**: Fully Homomorphic Encryption for privacy-preserving computations
- **Wagmi**: Ethereum wallet integration and RPC management
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library

### Security Features
- **Multi-Signature**: 2-of-N signature requirement for critical operations
- **Access Control**: Owner-only functions with proper modifiers
- **Input Validation**: Comprehensive parameter checking
- **Upgrade Safety**: UUPS proxy pattern for secure upgrades

## 🔧 Installation & Setup

### Prerequisites
- Node.js 20+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/RoseGissing/art-lock-review.git
cd art-lock-review

# Install dependencies
npm install
cd ui && npm install && cd ..

# Set environment variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# Deploy contracts locally
npm run deploy:local

# Start development server
cd ui && npm run dev
```

## 📚 API Documentation

### Smart Contract Functions

#### Core Functions
```solidity
// Create new artwork
function createArtwork(string title, string description) external onlyArtist returns (uint256)

// Submit encrypted review
function submitReview(
    uint256 artworkId,
    externalEuint32 encryptedRating,
    bytes inputProof,
    string encryptedComment
) external onlyReviewer

// Get artwork information
function getArtwork(uint256 artworkId) external view returns (tuple)

// Get encrypted average score
function getEncryptedAverageScore(uint256 artworkId) external view returns (euint32)
```

#### Multi-Signature Functions
```solidity
// Submit transaction for approval
function submitTransaction(address destination, uint256 value, bytes data) external onlySigner

// Confirm pending transaction
function confirmTransaction(bytes32 txHash) external onlySigner

// Execute approved transaction
function executeTransaction(bytes32 txHash, address destination, uint256 value, bytes data) internal
```

#### NFT Functions
```solidity
// Mint artwork token
function mintArtwork(uint256 artworkId, address to) external onlyArtist returns (uint256)

// Transfer token ownership
function transfer(address to, uint256 tokenId) external

// Get token information
function tokenURI(uint256 tokenId) external view returns (string)
```

### React Hooks API

#### useWalletConnection
```typescript
const {
  address,
  isConnected,
  connect,
  disconnect,
  balance,
  networkName,
  error,
  clearError
} = useWalletConnection();
```

#### useArtworkReview
```typescript
const {
  reviews,
  isLoading,
  submitReview,
  refreshReviews
} = useArtworkReview(artworkId);
```

#### useNotifications
```typescript
const {
  notifications,
  addNotification,
  markAsRead,
  clearAll,
  unreadCount
} = useNotifications();
```

## 🎬 Demo Video

The platform includes a comprehensive demo video showcasing:
- Artist onboarding and artwork creation
- Reviewer registration and rating submission
- Real-time encrypted score aggregation
- Privacy-preserving statistics display
- Multi-signature governance in action

**Demo Video**: [Watch on GitHub](art-lock-review.mp4)

---

## 🎯 Roadmap

### Phase 1 ✅ (Completed)
- [x] Basic FHE rating system
- [x] Multi-signature governance
- [x] Artist and reviewer dashboards
- [x] Encrypted review submission

### Phase 2 🚧 (In Development)
- [ ] Cross-chain deployment
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with major NFT marketplaces

### Phase 3 📋 (Planned)
- [ ] DAO governance implementation
- [ ] Advanced reputation system
- [ ] Artist funding mechanisms
- [ ] Global art community features

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get involved.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Project Lead**: PrimaClara23 & GregaryRichardson
- **Email**: contact@artlockreview.com
- **Twitter**: [@ArtLockReview](https://twitter.com/ArtLockReview)
- **Discord**: [Join our community](https://discord.gg/artlockreview)

---

*Built with ❤️ for the art community using cutting-edge Web3 technology*

## 🚀 Live Demo

**Try it now:** [https://art-lock-review-1.vercel.app/](https://art-lock-review-1.vercel.app/)

## 📹 Demo Video

Watch the demo video to see the system in action: [Demo Video](https://github.com/RoseGissing/art-lock-review/blob/main/art-lock-review.mp4)

## Features

- **Anonymous Rating**: Judges submit encrypted scores (1-10) that remain private
- **FHE Average Calculation**: Contract calculates average scores using fully homomorphic encryption
- **Decryptable Averages**: Final average scores can be decrypted and displayed
- **Rainbow Wallet Integration**: Connect using Rainbow wallet plugin
- **Local & Testnet Support**: Deploy to local Hardhat network or Sepolia testnet
- **Privacy-Preserving**: Individual ratings are never revealed, only aggregated averages

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager
- **Rainbow Wallet**: Browser extension installed

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd ui && npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile contracts**

   ```bash
   npm run compile
   ```

4. **Run local tests**

   ```bash
   npm run test
   ```

5. **Deploy to local network**

   ```bash
   # Terminal 1: Start a local FHEVM-ready node
   npx hardhat node

   # Terminal 2: Deploy to local network
   npx hardhat deploy --network localhost
   ```

   Copy the deployed contract address and set it in `ui/.env.local`:
   ```
   VITE_CONTRACT_ADDRESS=0x...
   ```

6. **Start frontend**

   ```bash
   cd ui
   npm run dev
   ```

7. **Deploy to Sepolia Testnet** (after local testing)

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   
   # Update VITE_CONTRACT_ADDRESS in ui/.env.local with Sepolia address
   
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

## 📁 Project Structure

```
art-lock-review/
├── contracts/              # Smart contract source files
│   ├── FHECounter.sol      # Example FHE counter contract
│   └── ArtworkRating.sol   # Main artwork rating contract
├── deploy/                 # Deployment scripts
├── tasks/                  # Hardhat custom tasks
├── test/                   # Test files
│   ├── ArtworkRating.ts    # Local tests
│   └── ArtworkRatingSepolia.ts  # Sepolia tests
├── ui/                     # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks (useArtworkRating, useFhevm)
│   │   ├── fhevm/          # FHEVM utilities
│   │   └── pages/          # Page components
│   └── public/             # Static assets
├── hardhat.config.ts       # Hardhat configuration
└── package.json            # Dependencies and scripts
```

## 📜 Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests (local)    |
| `npm run test:sepolia` | Run tests on Sepolia |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 🔐 Contract Overview

### ArtworkRating.sol

The main smart contract that handles anonymous artwork rating using Fully Homomorphic Encryption.

**Key Data Structures:**

```solidity
struct Artwork {
    string title;
    address artist;
    euint32 encryptedTotalScore;  // Sum of all encrypted scores
    euint32 encryptedCount;        // Number of ratings (encrypted)
    uint256 ratingCount;          // Plaintext count for verification
    bool exists;
}
```

**Key Functions:**

- `createArtwork(string title)`: Create a new artwork for rating
  - Returns: `artworkId` - The ID of the newly created artwork
  - Emits: `ArtworkCreated` event

- `submitRating(uint256 artworkId, externalEuint32 encryptedScore, bytes inputProof)`: Submit an encrypted rating
  - Parameters:
    - `artworkId`: The ID of the artwork to rate
    - `encryptedScore`: The encrypted score (must be between 1-10)
    - `inputProof`: The FHE input proof for verification
  - Requirements:
    - Artwork must exist
    - Judge must not have already rated this artwork
  - Effects:
    - Adds encrypted score to total
    - Increments encrypted count
    - Grants decryption permissions to the judge
  - Emits: `RatingSubmitted` event

- `getArtworkInfo(uint256 artworkId)`: Get artwork metadata
  - Returns: `title`, `artist`, `ratingCount`

- `getEncryptedTotalScore(uint256 artworkId)`: Get encrypted sum of all scores
  - Returns: `euint32` encrypted total

- `getEncryptedCount(uint256 artworkId)`: Get encrypted count of ratings
  - Returns: `euint32` encrypted count

- `hasRated(uint256 artworkId, address judge)`: Check if judge has rated
  - Returns: `bool` indicating if the judge has already rated

- `getArtworkCount()`: Get total number of artworks
  - Returns: `uint256` count

## 🔒 Encryption & Decryption Logic

### Rating Submission (Encryption)

When a judge submits a rating, the following encryption process occurs:

1. **Client-Side Encryption** (`useArtworkRating.tsx`):
   ```typescript
   // Create encrypted input using FHEVM
   const encryptedInput = fhevmInstance.createEncryptedInput(
     contractAddress,
     userAddress
   );
   encryptedInput.add32(score);  // Add score (1-10) as euint32
   const encrypted = await encryptedInput.encrypt();
   ```

2. **Contract Submission**:
   - The encrypted score is submitted to the contract as `externalEuint32`
   - The contract verifies the input proof
   - The encrypted score is converted to `euint32` using `FHE.fromExternal()`
   - The score is added to the encrypted total: `encryptedTotalScore = FHE.add(encryptedTotalScore, score)`
   - The count is incremented: `encryptedCount = FHE.add(encryptedCount, 1)`
   - Decryption permissions are granted to the judge

3. **Privacy Guarantees**:
   - Individual scores are never stored in plaintext
   - Only encrypted values are stored on-chain
   - Each judge can only decrypt the aggregate (total and count), not individual scores

### Average Score Decryption

To decrypt and display the average score:

1. **Retrieve Encrypted Values**:
   ```typescript
   const encryptedTotal = await contract.getEncryptedTotalScore(artworkId);
   const encryptedCount = await contract.getEncryptedCount(artworkId);
   ```

2. **Generate Decryption Keypair**:
   ```typescript
   const keypair = fhevmInstance.generateKeypair();
   ```

3. **Create EIP712 Signature**:
   ```typescript
   const eip712 = fhevmInstance.createEIP712(
     keypair.publicKey,
     contractAddresses,
     startTimestamp,
     durationDays
   );
   const signature = await signer.signTypedData(...);
   ```

4. **Decrypt Values**:
   ```typescript
   const decryptedResult = await fhevmInstance.userDecrypt(
     handleContractPairs,
     keypair.privateKey,
     keypair.publicKey,
     signature,
     contractAddresses,
     userAddress,
     startTimestamp,
     durationDays
   );
   ```

5. **Calculate Average**:
   ```typescript
   const decryptedTotal = Number(decryptedResult[totalHandle]);
   const decryptedCount = Number(decryptedResult[countHandle]);
   const average = decryptedCount === 0 ? 0 : decryptedTotal / decryptedCount;
   ```

### FHEVM Integration

The system uses the Zama FHEVM SDK for encryption/decryption:

- **Instance Creation**: `useFhevm` hook initializes FHEVM instance with provider and chain ID
- **Encryption**: Uses `createEncryptedInput()` to encrypt scores before submission
- **Decryption**: Uses `userDecrypt()` with EIP712 signatures for secure decryption
- **Permissions**: Contract grants decryption permissions via `FHE.allow()` and `FHE.allowThis()`

### Security Features

1. **Input Validation**: Scores must be between 1-10 (enforced by FHE range proofs)
2. **Duplicate Prevention**: Each judge can only rate once per artwork
3. **Encrypted Storage**: All sensitive data stored as `euint32` (encrypted)
4. **Decryption Permissions**: Only authorized users can decrypt aggregate values
5. **Proof Verification**: FHE input proofs ensure encrypted values are valid

## Frontend Usage

1. **Connect Wallet**: Click the Rainbow wallet button in the top right
2. **Create Artwork**: Click "Create Artwork" button and enter a title
3. **Submit Rating**: Click "Submit Rating" on an artwork card, select score (1-10)
4. **View Average**: Click "Decrypt Average" to decrypt and display the average score

## Testing

### Local Network Testing

```bash
# Start local node
npx hardhat node

# Run tests
npm run test
```

### Sepolia Testnet Testing

```bash
# Deploy first
npx hardhat deploy --network sepolia

# Then run tests
npm run test:sepolia
```

## 🏗️ Architecture

### Smart Contract Layer

- **ArtworkRating.sol**: Main contract handling encrypted rating storage and computation
- Uses FHE operations for privacy-preserving calculations
- Grants decryption permissions to authorized users

### Frontend Layer

- **React + TypeScript**: Modern UI built with React and TypeScript
- **Wagmi + RainbowKit**: Wallet connection and Web3 integration
- **FHEVM SDK**: Client-side encryption/decryption using Zama FHEVM
- **Ethers.js**: Contract interaction and transaction handling

### Encryption Flow

```
User Input (Score 1-10)
    ↓
FHEVM Encryption (Client)
    ↓
Encrypted Score + Proof
    ↓
Smart Contract (On-chain)
    ↓
FHE Addition (encryptedTotalScore, encryptedCount)
    ↓
Decryption Request (Authorized User)
    ↓
EIP712 Signature
    ↓
FHEVM Decryption (Client)
    ↓
Average Score Display
```

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [Rainbow Wallet](https://rainbow.me/)
- [Zama FHEVM GitHub](https://github.com/zama-ai/fhevm)

## 🔧 Technical Details

### FHE Operations

- **Encryption Type**: `euint32` (encrypted 32-bit unsigned integer)
- **External Format**: `externalEuint32` for cross-contract calls
- **Operations Supported**: Addition (`FHE.add`), comparison, decryption
- **Range Validation**: Scores must be between 1-10 (enforced by input proofs)

### Gas Considerations

- FHE operations require higher gas limits (~5,000,000 gas)
- Decryption operations are performed off-chain (client-side)
- Contract storage uses encrypted values (no plaintext sensitive data)

### Network Support

- **Localhost**: For development and testing
- **Sepolia Testnet**: For public testing
- **Mainnet**: Ready for production deployment (with proper configuration)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Zama FHEVM**
