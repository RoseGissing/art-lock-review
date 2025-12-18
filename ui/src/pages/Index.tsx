import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Artwork } from "@/types/artwork";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Sparkles, Shield, Eye, Lock } from "lucide-react";
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

// Decorative floating shapes component
const FloatingDecorations = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {/* Large gradient orbs */}
    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/10 to-teal-500/5 blur-3xl animate-float" />
    <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-teal-400/10 to-cyan-500/5 blur-3xl animate-float-reverse animation-delay-200" />
    <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-gradient-to-bl from-cyan-300/10 to-teal-400/5 blur-3xl animate-float animation-delay-400" />
    
    {/* Decorative geometric shapes */}
    <div className="absolute top-1/4 right-10 w-4 h-4 bg-cyan-500/20 rounded-full animate-pulse-glow" />
    <div className="absolute top-1/2 left-20 w-3 h-3 bg-teal-500/20 rounded-full animate-pulse-glow animation-delay-300" />
    <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse-glow animation-delay-500" />
    
    {/* Rotating ring decoration */}
    <div className="absolute top-20 left-1/4 w-32 h-32 border border-cyan-500/10 rounded-full animate-rotate-slow" />
    <div className="absolute bottom-40 right-20 w-24 h-24 border border-teal-500/10 rounded-full animate-rotate-slow" style={{ animationDirection: 'reverse' }} />
  </div>
);

// Feature highlight cards (decorative)
const FeatureHighlights = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up animation-delay-300">
    <div className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/5">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Shield className="w-6 h-6 text-cyan-500" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">FHE Protected</h3>
      <p className="text-sm text-muted-foreground">Fully Homomorphic Encryption ensures your ratings remain completely private</p>
    </div>
    
    <div className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/5">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Eye className="w-6 h-6 text-cyan-500" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">Anonymous Voting</h3>
      <p className="text-sm text-muted-foreground">Rate artworks without revealing your identity or individual scores</p>
    </div>
    
    <div className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/5">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Lock className="w-6 h-6 text-cyan-500" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">Decryptable Averages</h3>
      <p className="text-sm text-muted-foreground">Only aggregate scores can be revealed, individual votes stay encrypted</p>
    </div>
  </div>
);

// Decorative stats section
const StatsSection = ({ artworkCount, totalRatings }: { artworkCount: number; totalRatings: number }) => (
  <div className="flex justify-center gap-8 md:gap-16 py-8 mb-8 animate-fade-in-up animation-delay-400">
    <div className="text-center group">
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
        {artworkCount}
      </div>
      <div className="text-sm text-muted-foreground mt-1">Artworks</div>
    </div>
    <div className="w-px bg-border/50" />
    <div className="text-center group">
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
        {totalRatings}
      </div>
      <div className="text-sm text-muted-foreground mt-1">Total Ratings</div>
    </div>
    <div className="w-px bg-border/50" />
    <div className="text-center group">
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
        100%
      </div>
      <div className="text-sm text-muted-foreground mt-1">Private</div>
    </div>
  </div>
);

const Index = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newArtworkTitle, setNewArtworkTitle] = useState("");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [decryptedScores, setDecryptedScores] = useState<Record<number, number>>({});
  const [decryptingId, setDecryptingId] = useState<number | null>(null);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const contractAddress = getContractAddress(chainId);

  const {
    artworks: contractArtworks,
    isLoading,
    message,
    createArtwork,
    submitRating,
    decryptAverageScore,
  } = useArtworkRating(contractAddress);

  // Merge contract data with mock image/description data and decrypted scores
  const artworks: Artwork[] = contractArtworks.map((artwork, index) => ({
    ...artwork,
    imageUrl: MOCK_ARTWORKS_DATA[index % MOCK_ARTWORKS_DATA.length]?.imageUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop",
    description: MOCK_ARTWORKS_DATA[index % MOCK_ARTWORKS_DATA.length]?.description || "A beautiful artwork.",
    averageScore: decryptedScores[artwork.id],
  }));

  // Calculate total ratings
  const totalRatings = artworks.reduce((sum, art) => sum + art.ratingCount, 0);

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
      setDecryptingId(artworkId);
      const average = await decryptAverageScore(artworkId);
      if (average !== undefined) {
        // Store the decrypted score in state
        setDecryptedScores(prev => ({
          ...prev,
          [artworkId]: average
        }));
      }
    } catch (error: any) {
      toast({
        title: "Decryption failed",
        description: error.message || "Unable to decrypt average score",
        variant: "destructive",
      });
    } finally {
      setDecryptingId(null);
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating decorative elements */}
      <FloatingDecorations />
      
      <Header />
      
      <main className={`container px-4 py-8 relative z-10 transition-all duration-700 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {!isConnected && (
          <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-2xl text-center animate-fade-in-up backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              <span className="font-medium text-foreground">Get Started</span>
            </div>
            <p className="text-sm text-foreground/80">
              Connect your Rainbow Wallet to submit anonymous ratings and view average scores.
            </p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-muted/50 backdrop-blur-sm rounded-xl border border-border/50 animate-fade-in-scale">
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-sm font-medium mb-4">
              <Lock className="w-4 h-4" />
              Powered by FHE
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              Anonymous Artwork
              <span className="block bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                Rating System
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg">
              Submit anonymous ratings (1-10) for artworks. Individual ratings remain private, 
              but average scores can be decrypted and displayed.
            </p>
          </div>
          {isConnected && (
            <Button 
              onClick={() => setIsCreateModalOpen(true)} 
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Artwork
            </Button>
          )}
        </div>

        {/* Feature Highlights */}
        <FeatureHighlights />

        {/* Stats Section */}
        <StatsSection artworkCount={artworks.length} totalRatings={totalRatings} />

        {/* Artworks Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6 animate-slide-in-left">
            <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-teal-500 rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">Gallery</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in-scale">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-muted-foreground">Loading artworks...</p>
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-cyan-500" />
              </div>
              <p className="text-muted-foreground text-lg">No artworks yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork, index) => (
                <div 
                  key={artwork.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ArtworkCard
                    artwork={artwork}
                    onRatingSubmit={handleRatingSubmit}
                    onDecryptAverage={handleDecryptAverage}
                    isLoading={isLoading}
                    isDecrypting={decryptingId === artwork.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decorative bottom section */}
        <div className="mt-16 py-12 border-t border-border/50 animate-fade-in-up animation-delay-500">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Built with Fully Homomorphic Encryption for true privacy
            </p>
            <div className="flex justify-center gap-4">
              <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-pulse-glow" />
              <div className="w-2 h-2 rounded-full bg-teal-500/50 animate-pulse-glow animation-delay-200" />
              <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-pulse-glow animation-delay-400" />
            </div>
          </div>
        </div>
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
