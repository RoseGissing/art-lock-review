import { useState } from "react";
import { Artwork } from "@/types/artwork";
import { Star, Unlock, Loader2 } from "lucide-react";
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
  isDecrypting?: boolean;
}

export const ArtworkCard = ({ artwork, onRatingSubmit, onDecryptAverage, isLoading, isDecrypting }: ArtworkCardProps) => {
  const { isConnected } = useAccount();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Card 
        className="group overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10 border-border/50 hover:border-cyan-500/30 card-hover-lift"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden bg-gallery-bg">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 blur-[1px]' : 'scale-100'}`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Decorative corner accent */}
          <div className={`absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Rating count overlay */}
          {artwork.ratingCount > 0 && (
            <div className={`absolute top-3 right-3 flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
              <Star className="w-3 h-3" />
              <span>{artwork.ratingCount} Ratings</span>
            </div>
          )}

          {/* Average Score - Large display when decrypted */}
          {artwork.averageScore !== undefined && (
            <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm rounded-xl p-4 shadow-lg animate-fade-in-scale">
              <div className="flex items-center justify-center gap-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i <= Math.round(artwork.averageScore! / 2) ? 'fill-white text-white' : 'text-white/40'}`} 
                    />
                  ))}
                </div>
                <div className="text-white">
                  <span className="text-3xl font-bold">{artwork.averageScore.toFixed(1)}</span>
                  <span className="text-lg opacity-80">/10</span>
                </div>
              </div>
              <p className="text-center text-white/80 text-xs mt-1">Average Score (Decrypted)</p>
            </div>
          )}

          {/* Hover overlay content */}
          {artwork.averageScore === undefined && (
            <div className={`absolute bottom-4 left-4 right-4 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-white/90 text-sm line-clamp-2">{artwork.description}</p>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4 bg-gradient-to-b from-card to-card/80">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-cyan-600 transition-colors duration-300">
              {artwork.title}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
              by {artwork.artist}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Score display area */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {artwork.averageScore !== undefined ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-yellow-600">{artwork.averageScore.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">/ 10</span>
                  </div>
                ) : artwork.ratingCount > 0 ? (
                  <Button
                    onClick={() => onDecryptAverage(artwork.id)}
                    variant="outline"
                    size="sm"
                    disabled={isLoading || isDecrypting}
                    className="border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all duration-300"
                  >
                    {isDecrypting ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-cyan-500" />
                        <span>Decrypting...</span>
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Unlock className="w-4 h-4 mr-1.5 text-cyan-500" />
                        <span>Decrypt Average</span>
                      </span>
                    )}
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground italic">No ratings yet</span>
                )}
              </div>
              <Badge variant="secondary" className="bg-muted/50">{artwork.ratingCount} ratings</Badge>
            </div>

            <Button
              onClick={() => setIsRatingModalOpen(true)}
              disabled={!isConnected || artwork.hasRated || isLoading}
              size="sm"
              className={`w-full transition-all duration-300 ${
                artwork.hasRated 
                  ? 'bg-muted text-muted-foreground' 
                  : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg hover:shadow-cyan-500/25'
              }`}
            >
              <Star className={`w-4 h-4 mr-1.5 ${artwork.hasRated ? '' : 'animate-pulse'}`} />
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
