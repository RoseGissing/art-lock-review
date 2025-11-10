import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

interface UseWalletConnectionReturn {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: string;
  networkName: string;
  error: string | null;
  clearError: () => void;
}

export const useWalletConnection = (): UseWalletConnectionReturn => {
  const [balance, setBalance] = useState('0');
  const [networkName, setNetworkName] = useState('Unknown');
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { connectAsync, isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // 修复：添加完整的钱包连接错误处理
  const connect = useCallback(async () => {
    try {
      setError(null);
      await connectAsync({ connector: new InjectedConnector() });
      console.log('Wallet connected successfully');
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);

      // 处理不同类型的连接错误
      if (error.code === 4001) {
        setError('User rejected the connection request');
      } else if (error.code === -32002) {
        setError('Connection request already pending');
      } else if (error.message?.includes('No injected provider')) {
        setError('No wallet extension found. Please install MetaMask or similar');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
      throw error;
    }
  }, [connectAsync]);

  // 修复：disconnect添加错误处理
  const handleDisconnect = useCallback(() => {
    try {
      setError(null);
      disconnect();
      setBalance('0');
      setNetworkName('Unknown');
      console.log('Wallet disconnected successfully');
    } catch (error: any) {
      console.error('Failed to disconnect wallet:', error);
      setError('Failed to disconnect wallet');
    }
  }, [disconnect]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 修复：balance更新逻辑添加错误处理
  useEffect(() => {
    const fetchBalanceAndNetwork = async () => {
      if (isConnected && address) {
        try {
          // 模拟balance获取（实际应该调用provider）
          setBalance('1.2345');
          setNetworkName('Sepolia');
          setError(null);
        } catch (error: any) {
          console.error('Failed to fetch balance:', error);
          setError('Failed to fetch account information');
          setBalance('0');
          setNetworkName('Unknown');
        }
      } else {
        setBalance('0');
        setNetworkName('Unknown');
      }
    };

    fetchBalanceAndNetwork();
  }, [isConnected, address]);

  return {
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect: handleDisconnect,
    balance,
    networkName,
    error,
    clearError,
  };
};
