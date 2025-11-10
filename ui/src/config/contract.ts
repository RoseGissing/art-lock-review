// Contract configuration
// For localhost, use the deployed contract address
// For other networks, set VITE_CONTRACT_ADDRESS environment variable

// Contract address from deployments/localhost/ArtworkRating.json
// Update this after redeploying the contract
const LOCALHOST_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export function getContractAddress(chainId?: number): string | undefined {
  // For localhost (chainId 31337), always use the default deployed address
  // This ensures we use the latest deployed contract address
  if (chainId === 31337 || chainId === undefined) {
    console.log("[getContractAddress] Using localhost address:", LOCALHOST_CONTRACT_ADDRESS, "for chainId:", chainId);
    return LOCALHOST_CONTRACT_ADDRESS;
  }

  // For other networks, check environment variable
  const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (envAddress) {
    console.log("[getContractAddress] Using environment variable:", envAddress, "for chainId:", chainId);
    return envAddress;
  }

  // For other networks without env var, return undefined
  console.log("[getContractAddress] No address configured for chainId:", chainId);
  return undefined;
}

