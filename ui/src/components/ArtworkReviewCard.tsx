import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, Eye, MessageCircle } from 'lucide-react';

interface ArtworkReviewCardProps {
  artworkId: number;
  title: string;
  artist: string;
  description: string;
  reviewCount: number;
  averageRating?: number;
  onViewDetails: (id: number) => void;
  onSubmitReview: (id: number) => void;
}

export const ArtworkReviewCard: React.FC<ArtworkReviewCardProps> = ({
  artworkId,
  title,
  artist,
  description,
  reviewCount,
  averageRating,
  onViewDetails,
  onSubmitReview,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  // 修复：添加事件监听器cleanup - 修复内存泄漏
  useEffect(() => {
    const handleResize = () => {
      // 动态调整卡片布局
      setViewCount(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);

    // 修复：添加cleanup函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 修复：另一个事件监听器添加cleanup
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setViewCount(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 修复：添加cleanup函数
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Card
      className={`transition-all duration-300 cursor-pointer ${
        isHovered ? 'shadow-lg scale-105' : 'shadow-md'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onViewDetails(artworkId)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">{title}</CardTitle>
          <Badge variant="secondary" className="ml-2">
            {reviewCount} reviews
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">by {artist}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {averageRating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium ml-1">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="w-4 h-4 mr-1" />
              {viewCount}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSubmitReview(artworkId);
            }}
            className="flex items-center"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
