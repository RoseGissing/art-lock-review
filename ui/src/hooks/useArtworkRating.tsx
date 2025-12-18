import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "./useInMemoryStorage";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";

// Contract ABI - will be generated from contract compilation
// Note: externalEuint32 is compiled as bytes32, not a tuple
const ArtworkRatingABI = [
  "function createArtwork(string calldata title) external returns (uint256 artworkId)",
  "function submitRating(uint256 artworkId, bytes32 encryptedScore, bytes calldata inputProof) external",
  "function requestDecryptionAccess(uint256 artworkId) external",
  "function getArtworkInfo(uint256 artworkId) external view returns (string memory title, address artist, uint256 ratingCount)",
  "function getEncryptedTotalScore(uint256 artworkId) external view returns (bytes32)",
  "function getEncryptedCount(uint256 artworkId) external view returns (bytes32)",
  "function hasRated(uint256 artworkId, address judge) external view returns (bool)",
  "function getArtworkCount() external view returns (uint256)",
  "event ArtworkCreated(uint256 indexed artworkId, address indexed artist, string title)",
  "event RatingSubmitted(uint256 indexed artworkId, address indexed judge)",
];

interface UseArtworkRatingState {
  contractAddress: string | undefined;
  artworks: any[];
  isLoading: boolean;
  message: string | undefined;
  createArtwork: (title: string) => Promise<void>;
  submitRating: (artworkId: number, score: number) => Promise<void>;
  loadArtworks: () => Promise<void>;
  decryptAverageScore: (artworkId: number) => Promise<number | undefined>;
}

export function useArtworkRating(contractAddress: string | undefined): UseArtworkRatingState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const [artworks, setArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersProvider, setEthersProvider] = useState<ethers.JsonRpcProvider | undefined>(undefined);

  // Get EIP1193 provider
  const eip1193Provider = useCallback(() => {
    if (chainId === 31337) {
      return "http://localhost:8545";
    }
    if (walletClient?.transport) {
      const transport = walletClient.transport as any;
      if (transport.value && typeof transport.value.request === "function") {
        return transport.value;
      }
      if (typeof transport.request === "function") {
        return transport;
      }
    }
    if (typeof window !== "undefined" && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return undefined;
  }, [chainId, walletClient]);

  // Initialize FHEVM
  const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({
    provider: eip1193Provider(),
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: isConnected && !!contractAddress,
  });

  // Convert walletClient to ethers signer
  useEffect(() => {
    if (!walletClient || !chainId) {
      setEthersSigner(undefined);
      setEthersProvider(undefined);
      return;
    }

    const setupEthers = async () => {
      try {
        const provider = new ethers.BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        setEthersProvider(provider as any);
        setEthersSigner(signer);
      } catch (error) {
        console.error("Error setting up ethers:", error);
        setEthersSigner(undefined);
        setEthersProvider(undefined);
      }
    };

    setupEthers();
  }, [walletClient, chainId]);

  const createArtwork = useCallback(
    async (title: string) => {
      if (!contractAddress || !ethersSigner) {
        setMessage("Contract not deployed or wallet not connected");
        return;
      }

      try {
        setIsLoading(true);
        setMessage("Creating artwork...");
        const contract = new ethers.Contract(contractAddress, ArtworkRatingABI, ethersSigner);
        const tx = await contract.createArtwork(title);
        await tx.wait();
        setMessage("Artwork created successfully");
        await loadArtworks();
      } catch (error: any) {
        setMessage(`Error: ${error.message}`);
        console.error("Error creating artwork:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [contractAddress, ethersSigner]
  );

  const submitRating = useCallback(
    async (artworkId: number, score: number) => {
      if (!contractAddress || !ethersSigner || !fhevmInstance || !address) {
        setMessage("Missing requirements for rating submission");
        return;
      }

      if (score < 1 || score > 10) {
        setMessage("Score must be between 1 and 10");
        return;
      }

      try {
        setIsLoading(true);
        setMessage("Encrypting score...");

        // Encrypt score using FHEVM
        console.log("[submitRating] Creating encrypted input...", {
          contractAddress,
          userAddress: address,
          score,
        });
        
        const encryptedInput = fhevmInstance.createEncryptedInput(
          contractAddress as `0x${string}`,
          address as `0x${string}`
        );
        encryptedInput.add32(score);
        const encrypted = await encryptedInput.encrypt();
        
        console.log("[submitRating] Encryption complete:", {
          handles: encrypted.handles,
          inputProofLength: encrypted.inputProof?.length || 0,
          inputProofHex: encrypted.inputProof ? ethers.hexlify(encrypted.inputProof).substring(0, 100) + "..." : "none",
        });
        
        setMessage("Submitting rating...");
        
        // Verify contract is deployed
        console.log("[submitRating] Checking contract at address:", contractAddress);
        const contractCode = await ethersProvider.getCode(contractAddress);
        if (contractCode === "0x" || contractCode.length <= 2) {
          console.error("[submitRating] Contract not found at:", contractAddress);
          throw new Error(`Contract not deployed at ${contractAddress}. Please deploy the contract first.`);
        }
        console.log("[submitRating] Contract code length:", contractCode.length, "bytes");
        
        const contract = new ethers.Contract(contractAddress, ArtworkRatingABI, ethersSigner);
        
        // Check if artwork exists and user hasn't rated
        try {
          console.log("[submitRating] Checking artwork existence for ID:", artworkId);
          const artworkInfo = await contract.getArtworkInfo(artworkId);
          console.log("[submitRating] Artwork info:", {
            title: artworkInfo[0],
            artist: artworkInfo[1],
            ratingCount: artworkInfo[2].toString(),
          });
          
          if (address) {
            console.log("[submitRating] Checking if user has already rated:", address);
            const hasRated = await contract.hasRated(artworkId, address);
            console.log("[submitRating] Has rated:", hasRated);
            if (hasRated) {
              throw new Error("You have already rated this artwork");
            }
          } else {
            console.warn("[submitRating] No user address available for hasRated check");
          }
        } catch (checkError: any) {
          console.error("[submitRating] Pre-submit check error:", checkError);
          if (checkError.message?.includes("Artwork does not exist")) {
            throw new Error(`Artwork with ID ${artworkId} does not exist. Please create an artwork first.`);
          }
          throw checkError;
        }
        
        // For externalEuint32, pass handle directly as bytes32 (not wrapped in struct)
        // Based on privateself implementation and test code, we pass handles[0] directly
        // The handles are already in the correct format from FHEVM encryption
        const encryptedScoreHandle = encrypted.handles[0];
        
        if (!encryptedScoreHandle) {
          throw new Error("Encrypted handle is missing. Encryption may have failed.");
        }
        
        if (!encrypted.inputProof || encrypted.inputProof.length === 0) {
          throw new Error("Input proof is missing. Encryption may have failed.");
        }
        
        // Pass inputProof directly as-is, just like privateself does
        // FHEVM returns inputProof in the correct format
        const inputProof = encrypted.inputProof;
        
        console.log("[submitRating] Submitting rating with:", {
          artworkId,
          handle: typeof encryptedScoreHandle === "string" 
            ? encryptedScoreHandle.substring(0, 20) + "..." 
            : String(encryptedScoreHandle).substring(0, 30),
          handleType: typeof encryptedScoreHandle,
          hasInputProof: !!inputProof,
          inputProofLength: inputProof?.length || 0,
        });
        
        // Try to simulate the call first to get better error messages
        // Note: For FHE operations, static calls may fail even when actual transactions succeed
        // So we'll log the error but continue with the actual transaction
        try {
          console.log("[submitRating] Simulating transaction with callStatic...");
          await contract.submitRating.staticCall(
            artworkId,
            encryptedScoreHandle,
            inputProof
          );
          console.log("[submitRating] Static call succeeded - transaction should work");
        } catch (staticError: any) {
          console.warn("[submitRating] Static call failed (this may be normal for FHE operations):");
          console.warn("[submitRating] Error message:", staticError.message);
          console.warn("[submitRating] Error reason:", staticError.reason);
          console.warn("[submitRating] Error data:", staticError.data);
          console.warn("[submitRating] Continuing with actual transaction - FHE operations sometimes fail static calls but succeed in actual transactions");
          
          // Don't throw here - FHE operations often fail static calls but work in actual transactions
          // This is because FHE validation happens differently in static vs actual calls
        }
        
        // Try gas estimation
        try {
          const gasEstimate = await contract.submitRating.estimateGas(
            artworkId,
            encryptedScoreHandle,
            inputProof
          );
          console.log("[submitRating] Gas estimate:", gasEstimate.toString());
        } catch (estimateError: any) {
          console.warn("[submitRating] Gas estimation failed:", estimateError.message);
          // Don't throw here - sometimes Hardhat node has issues with gas estimation
          // but the actual transaction might work
        }
        
        // Try the transaction with a higher gas limit
        console.log("[submitRating] Calling contract.submitRating...");
        const tx = await contract.submitRating(
          artworkId,
          encryptedScoreHandle,
          inputProof,
          {
            gasLimit: 5000000, // Set a high gas limit for FHE operations
          }
        );
        console.log("[submitRating] Transaction sent:", tx.hash);
        console.log("[submitRating] Waiting for transaction confirmation...");
        const receipt = await tx.wait();
        console.log("[submitRating] Transaction confirmed:", {
          hash: receipt.hash,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
        });
        setMessage("Rating submitted successfully");
        await loadArtworks();
      } catch (error: any) {
        let errorMessage = error.reason || error.message || String(error);
        
        // Check for specific error types
        if (error.code === "UNKNOWN_ERROR" || error.code === -32603) {
          errorMessage = `Hardhat node internal error. This usually means:
1. Hardhat node is not running with FHEVM support
2. Contract execution failed (check Hardhat node logs)
3. FHE operation failed

Please ensure:
- Hardhat node is running: npx hardhat node
- Contract is deployed: npx hardhat deploy --network localhost
- Check Hardhat node terminal for detailed error messages`;
        }
        
        setMessage(`Error: ${errorMessage}`);
        console.error("Error submitting rating:", error);
        
        // Log additional details for debugging
        if (error.data) {
          console.error("Error data:", error.data);
        }
        if (error.transaction) {
          console.error("Failed transaction:", error.transaction);
        }
        if (error.payload) {
          console.error("RPC payload:", error.payload);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [contractAddress, ethersSigner, fhevmInstance, address]
  );

  const loadArtworks = useCallback(async () => {
    if (!contractAddress || !ethersProvider) {
      console.log("[loadArtworks] Skipping - contractAddress or ethersProvider not available", {
        contractAddress,
        hasProvider: !!ethersProvider,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Verify contract is deployed
      const contractCode = await ethersProvider.getCode(contractAddress);
      if (contractCode === "0x" || contractCode.length <= 2) {
        console.warn("[loadArtworks] Contract not deployed at", contractAddress);
        setMessage(`Contract not deployed at ${contractAddress}. Please deploy the contract first.`);
        setArtworks([]);
        return;
      }
      
      console.log("[loadArtworks] Loading artworks from contract", contractAddress);
      const contract = new ethers.Contract(contractAddress, ArtworkRatingABI, ethersProvider);
      const count = await contract.getArtworkCount();
      console.log("[loadArtworks] Artwork count:", count.toString());
      
      const artworkList: any[] = [];

      for (let i = 0; i < Number(count); i++) {
        const [title, artist, ratingCount] = await contract.getArtworkInfo(i);
        const hasRated = address ? await contract.hasRated(i, address) : false;
        artworkList.push({
          id: i,
          title,
          artist,
          artistAddress: artist,
          ratingCount: Number(ratingCount),
          hasRated,
        });
      }

      console.log("[loadArtworks] Loaded", artworkList.length, "artworks");
      setArtworks(artworkList);
    } catch (error: any) {
      console.error("[loadArtworks] Error loading artworks:", error);
      
      // Provide more helpful error messages
      if (error.code === "BAD_DATA" || error.message?.includes("could not decode")) {
        setMessage(`Contract not found at ${contractAddress}. Please ensure the contract is deployed.`);
      } else {
        setMessage(`Error loading artworks: ${error.message || "Unknown error"}`);
      }
      setArtworks([]);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, ethersProvider, address]);

  const decryptAverageScore = useCallback(
    async (artworkId: number): Promise<number | undefined> => {
      if (!contractAddress || !ethersProvider || !fhevmInstance || !ethersSigner || !address) {
        return undefined;
      }

      try {
        setMessage("Requesting decryption access...");
        const contractWithSigner = new ethers.Contract(contractAddress, ArtworkRatingABI, ethersSigner);
        
        // First request decryption access
        const accessTx = await contractWithSigner.requestDecryptionAccess(artworkId);
        await accessTx.wait();
        
        setMessage("Decrypting average score...");
        const contract = new ethers.Contract(contractAddress, ArtworkRatingABI, ethersProvider);
        
        const encryptedTotal = await contract.getEncryptedTotalScore(artworkId);
        const encryptedCount = await contract.getEncryptedCount(artworkId);

        // Convert to handle format
        const totalHandle = typeof encryptedTotal === "string" ? encryptedTotal : ethers.hexlify(encryptedTotal);
        const countHandle = typeof encryptedCount === "string" ? encryptedCount : ethers.hexlify(encryptedCount);

        console.log("[decryptAverageScore] Decrypting handles:", {
          totalHandle: totalHandle.substring(0, 20) + "...",
          countHandle: countHandle.substring(0, 20) + "...",
          hasUserDecrypt: typeof (fhevmInstance as any).userDecrypt === "function",
          hasGenerateKeypair: typeof (fhevmInstance as any).generateKeypair === "function",
          hasCreateEIP712: typeof (fhevmInstance as any).createEIP712 === "function",
        });

        // Check if instance has userDecrypt method
        if (typeof (fhevmInstance as any).userDecrypt !== "function") {
          throw new Error("FHEVM instance does not have userDecrypt method. Please ensure FHEVM is properly initialized.");
        }

        // Prepare handle-contract pairs
        const handleContractPairs = [
          { handle: totalHandle, contractAddress: contractAddress as `0x${string}` },
          { handle: countHandle, contractAddress: contractAddress as `0x${string}` },
        ];

        // Generate keypair for EIP712 signature
        let keypair: { publicKey: Uint8Array; privateKey: Uint8Array };
        if (typeof (fhevmInstance as any).generateKeypair === "function") {
          keypair = (fhevmInstance as any).generateKeypair();
        } else {
          // Fallback: create a mock keypair
          keypair = {
            publicKey: new Uint8Array(32).fill(0),
            privateKey: new Uint8Array(32).fill(0),
          };
        }

        // Create EIP712 signature for decryption
        const contractAddresses = [contractAddress as `0x${string}`];
        const startTimestamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "10";

        let eip712: any;
        if (typeof (fhevmInstance as any).createEIP712 === "function") {
          eip712 = (fhevmInstance as any).createEIP712(
            keypair.publicKey,
            contractAddresses,
            startTimestamp,
            durationDays
          );
        } else {
          // Fallback: create a simple EIP712 structure for mock
          eip712 = {
            domain: {
              name: "FHEVM",
              version: "1",
              chainId: 31337,
              verifyingContract: contractAddresses[0],
            },
            types: {
              UserDecryptRequestVerification: [
                { name: "publicKey", type: "bytes" },
                { name: "contractAddresses", type: "address[]" },
                { name: "startTimestamp", type: "string" },
                { name: "durationDays", type: "string" },
              ],
            },
            message: {
              publicKey: ethers.hexlify(keypair.publicKey),
              contractAddresses,
              startTimestamp,
              durationDays,
            },
          };
        }

        // Sign the EIP712 message
        const signature = await ethersSigner.signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message
        );

        // Decrypt using userDecrypt method
        const decryptedResult = await (fhevmInstance as any).userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signature,
          contractAddresses,
          address as `0x${string}`,
          startTimestamp,
          durationDays
        );

        const decryptedTotal = Number(decryptedResult[totalHandle] || 0);
        const decryptedCount = Number(decryptedResult[countHandle] || 0);

        console.log("[decryptAverageScore] Decrypted values:", {
          total: decryptedTotal,
          count: decryptedCount,
        });

        setMessage(undefined);
        if (decryptedCount === 0) return 0;
        return decryptedTotal / decryptedCount;
      } catch (error: any) {
        console.error("[decryptAverageScore] Error decrypting average score:", error);
        setMessage(`Error decrypting: ${error.message}`);
        return undefined;
      }
    },
    [contractAddress, ethersProvider, fhevmInstance, ethersSigner, address]
  );

  useEffect(() => {
    if (contractAddress && ethersProvider) {
      loadArtworks();
    }
  }, [contractAddress, ethersProvider, loadArtworks]);

  return {
    contractAddress,
    artworks,
    isLoading,
    message,
    createArtwork,
    submitRating,
    loadArtworks,
    decryptAverageScore,
  };
}

