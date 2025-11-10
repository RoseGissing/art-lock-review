import { useState } from "react";
import { Header } from "@/components/Header";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Artwork } from "@/types/artwork";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { useArtworkRating } from "@/hooks/useArtworkRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useChainId } from "wagmi";
import { getContractAddress } from "@/config/contract";

// Mock artwork data with images
const MOCK_ARTWORKS_DATA = [
  {
    title: "Digital Dreams",
    artist: "Alex Chen",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop",
    description: "An exploration of digital consciousness through vibrant abstract forms.",
  },
  {
    title: "Urban Serenity",
    artist: "Maya Rodriguez",
    imageUrl: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=800&fit=crop",
    description: "Finding peace in the chaos of modern city life.",
  },
  {
    title: "Nature's Algorithm",
    artist: "Jordan Kim",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop",
    description: "Where natural patterns meet computational aesthetics.",
  },
];

const Index = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newArtworkTitle, setNewArtworkTitle] = useState("");

  const contractAddress = getContractAddress(chainId);

  const {
    artworks: contractArtworks,
    isLoading,
    message,
    createArtwork,
    submitRating,
    decryptAverageScore,
  } = useArtworkRating(contractAddress);

  // Merge contract data with mock image/description data
  const artworks: Artwork[] = contractArtworks.map((artwork, index) => ({
    ...artwork,
    imageUrl: MOCK_ARTWORKS_DATA[index % MOCK_ARTWORKS_DATA.length]?.imageUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop",
    description: MOCK_ARTWORKS_DATA[index % MOCK_ARTWORKS_DATA.length]?.description || "A beautiful artwork.",
  }));

  const handleRatingSubmit = async (artworkId: number, score: number) => {
    try {
      await submitRating(artworkId, score);
      toast({
        title: "Rating submitted",
        description: "Your anonymous rating has been submitted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  const handleDecryptAverage = async (artworkId: number) => {
    try {
      const average = await decryptAverageScore(artworkId);
      if (average !== undefined) {
        toast({
          title: "Average score decrypted",
          description: `Average rating: ${average.toFixed(2)}/10`,
        });
        // Update artwork in state
        // This would ideally be handled by the hook
      }
    } catch (error: any) {
      toast({
        title: "Decryption failed",
        description: error.message || "Unable to decrypt average score",
        variant: "destructive",
      });
    }
  };

  const handleCreateArtwork = async () => {
    if (!newArtworkTitle.trim()) {
      toast({
        title: "Invalid title",
        description: "Please enter a title for the artwork",
        variant: "destructive",
      });
      return;
    }

    try {
      await createArtwork(newArtworkTitle.trim());
      setNewArtworkTitle("");
      setIsCreateModalOpen(false);
      toast({
        title: "Artwork created",
        description: "New artwork has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create artwork",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-8">
        {!isConnected && (
          <div className="mb-8 p-6 bg-primary/10 border border-primary/30 rounded-lg text-center">
            <p className="text-sm text-foreground/80">
              Connect your Rainbow Wallet to submit anonymous ratings and view average scores.
            </p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Anonymous Artwork Rating System
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Submit anonymous ratings (1-10) for artworks. Individual ratings remain private, 
              but average scores can be decrypted and displayed.
            </p>
          </div>
          {isConnected && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Artwork
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No artworks yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onRatingSubmit={handleRatingSubmit}
                onDecryptAverage={handleDecryptAverage}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </main>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Artwork</DialogTitle>
            <DialogDescription>
              Add a new artwork to the rating system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newArtworkTitle}
                onChange={(e) => setNewArtworkTitle(e.target.value)}
                placeholder="Enter artwork title"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateArtwork} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
