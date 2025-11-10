import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface ArtworkReview {
  id: number;
  artworkId: number;
  reviewer: string;
  rating: number;
  comment: string;
  timestamp: number;
}

interface UseArtworkReviewReturn {
  reviews: ArtworkReview[];
  isLoading: boolean;
  submitReview: (artworkId: number, rating: number, comment: string) => Promise<void>;
  refreshReviews: () => Promise<void>;
}

export const useArtworkReview = (artworkId?: number): UseArtworkReviewReturn => {
  const [reviews, setReviews] = useState<ArtworkReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();

  // 修复：添加事件监听器cleanup - 修复网络状态监听器内存泄漏
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network is online, refreshing reviews...');
      refreshReviews();
    };

    const handleOffline = () => {
      console.log('Network is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 修复：添加cleanup函数
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshReviews]);

  const refreshReviews = useCallback(async () => {
    if (!artworkId) return;

    setIsLoading(true);
    try {
      // Mock API call - in real implementation this would call the contract
      const mockReviews: ArtworkReview[] = [
        {
          id: 1,
          artworkId,
          reviewer: '0x1234...5678',
          rating: 8,
          comment: 'Excellent piece with great composition',
          timestamp: Date.now() - 86400000,
        },
        {
          id: 2,
          artworkId,
          reviewer: '0xabcd...efgh',
          rating: 7,
          comment: 'Interesting concept, could use more contrast',
          timestamp: Date.now() - 43200000,
        },
      ];

      setReviews(mockReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [artworkId]);

  const submitReview = useCallback(async (
    targetArtworkId: number,
    rating: number,
    comment: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      // Mock submission - in real implementation this would call the contract
      const newReview: ArtworkReview = {
        id: Date.now(),
        artworkId: targetArtworkId,
        reviewer: address,
        rating,
        comment,
        timestamp: Date.now(),
      };

      setReviews(prev => [...prev, newReview]);
      console.log('Review submitted successfully');
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refreshReviews();
  }, [refreshReviews]);

  return {
    reviews,
    isLoading,
    submitReview,
    refreshReviews,
  };
};
