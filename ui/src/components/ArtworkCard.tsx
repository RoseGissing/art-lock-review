import { useState } from "react";
import { Artwork } from "@/types/artwork";
import { Star, Lock, Unlock } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAccount } from "wagmi";
import { RatingModal } from "./RatingModal";

interface ArtworkCardProps {
  artwork: Artwork;
  onRatingSubmit: (artworkId: number, score: number) => void;
  onDecryptAverage: (artworkId: number) => void;
  isLoading?: boolean;
}

export const ArtworkCard = ({ artwork, onRatingSubmit, onDecryptAverage, isLoading }: ArtworkCardProps) => {
  const { isConnected } = useAccount();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-hover border-border/50">
        <div className="relative aspect-square overflow-hidden bg-gallery-bg">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating count overlay */}
          {artwork.ratingCount > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-full text-xs font-medium shadow-lg">
              <Star className="w-3 h-3" />
              <span>{artwork.ratingCount} Ratings</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {artwork.title}
            </h3>
            <p className="text-sm text-muted-foreground">by {artwork.artist}</p>
          </div>

          <p className="text-sm text-foreground/70 line-clamp-2">
            {artwork.description}
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {artwork.averageScore !== undefined ? (
                  <>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{artwork.averageScore.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">/ 10</span>
                  </>
                ) : artwork.ratingCount > 0 ? (
                  <Button
                    onClick={() => onDecryptAverage(artwork.id)}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Unlock className="w-4 h-4 mr-1.5" />
                    Decrypt Average
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">No ratings yet</span>
                )}
              </div>
              <Badge variant="secondary">{artwork.ratingCount} ratings</Badge>
            </div>

            <Button
              onClick={() => setIsRatingModalOpen(true)}
              disabled={!isConnected || artwork.hasRated || isLoading}
              size="sm"
              className="w-full"
            >
              <Star className="w-4 h-4 mr-1.5" />
              {artwork.hasRated ? "Already Rated" : "Submit Rating"}
            </Button>
          </div>
        </div>
      </Card>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={(score) => {
          onRatingSubmit(artwork.id, score);
          setIsRatingModalOpen(false);
        }}
        artworkTitle={artwork.title}
        isLoading={isLoading}
      />
    </>
  );
};
