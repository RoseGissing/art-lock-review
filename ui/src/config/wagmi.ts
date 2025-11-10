import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains';

// Local Hardhat network
const localhost = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'Anonymous Artwork Rating System',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [localhost, sepolia, mainnet, polygon, optimism, arbitrum],
  ssr: false,
});
