import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Star, Lock, Shield } from 'lucide-react';
import { useWalletConnection } from '../hooks/useWalletConnection';

interface EncryptedRatingInputProps {
  artworkId: number;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const EncryptedRatingInput: React.FC<EncryptedRatingInputProps> = ({
  artworkId,
  onSubmit,
  isSubmitting = false,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isValid, setIsValid] = useState(false);
  const { isConnected } = useWalletConnection();

  const validateInput = useCallback((newRating: number, newComment: string) => {
    const ratingValid = newRating >= 1 && newRating <= 10;
    const commentValid = newComment.trim().length >= 10;
    setIsValid(ratingValid && commentValid && isConnected);
  }, [isConnected]);

  const handleRatingChange = useCallback((newRating: number) => {
    setRating(newRating);
    validateInput(newRating, comment);
  }, [comment, validateInput]);

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    setComment(newComment);
    validateInput(rating, newComment);
  }, [rating, validateInput]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    try {
      await onSubmit(rating, comment);
      // Reset form on success
      setRating(0);
      setComment('');
      setIsValid(false);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      // Error handling is done by parent component
    }
  }, [rating, comment, isValid, isSubmitting, onSubmit]);

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className={`p-1 rounded transition-colors ${
              star <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
            disabled={isSubmitting}
          >
            <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Submit Encrypted Review
          <Lock className="w-4 h-4 text-green-500" />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your rating and review will be encrypted using FHE technology
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Input */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-base font-medium">
              Rating (1-10) *
            </Label>
            {renderStars()}
            <p className="text-xs text-muted-foreground">
              Selected rating: {rating > 0 ? rating : 'None'}
            </p>
          </div>

          {/* Comment Input */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-medium">
              Review Comment *
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Share your thoughts about this artwork... (minimum 10 characters)"
              rows={4}
              disabled={isSubmitting}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/10 characters minimum
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Privacy Protected</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your rating will be encrypted and only aggregated statistics will be visible to the artist.
                  Individual reviews remain completely private.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Encrypting & Submitting...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Submit Encrypted Review
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-sm text-red-600 text-center">
              Please connect your wallet to submit reviews
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
