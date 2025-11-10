import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Artwork } from "@/types/artwork";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trophy, Gavel } from "lucide-react";
import { useArtworkRating } from "@/hooks/useArtworkRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
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
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newArtworkTitle, setNewArtworkTitle] = useState("");
  const [activeTab, setActiveTab] = useState("gallery");
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  // 轻度缺陷：排行榜数据使用mock数据
  const [leaderboard] = useState([
    { id: 1, title: "Digital Dreams", artist: "Alex Chen", score: 8.5, reviews: 12 },
    { id: 2, title: "Urban Serenity", artist: "Maya Rodriguez", score: 7.8, reviews: 8 },
    { id: 3, title: "Nature's Algorithm", artist: "Jordan Kim", score: 9.2, reviews: 15 },
  ]);
  // 中度缺陷：拍卖数据也是mock的
  const [auctions] = useState([
    { id: 1, artworkId: 1, title: "Digital Dreams", seller: "Alex Chen", currentBid: 0.5, endTime: Date.now() + 3600000 },
    { id: 2, artworkId: 2, title: "Urban Serenity", seller: "Maya Rodriguez", currentBid: 0.8, endTime: Date.now() + 7200000 },
  ]);

  // 中度缺陷：刷新排行榜功能有bug - 会导致UI冻结
  const handleRefreshLeaderboard = async () => {
    try {
      // 重度缺陷：无限循环调用，UI会冻结
      await handleRefreshLeaderboard(); // 递归调用自己
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh leaderboard",
        variant: "destructive",
      });
    }
  };

  const contractAddress = getContractAddress(chainId);

  // 中度缺陷：连接状态检查逻辑有bug - 不会正确更新状态
  React.useEffect(() => {
    if (isConnected && address) {
      setConnectionStatus('connected');
    } else if (!isConnected) {
      setConnectionStatus('disconnected');
    }
    // 重度缺陷：缺少对address变化的依赖，状态不会正确更新
  }, [isConnected]); // 故意缺少address依赖

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
        {connectionStatus === 'disconnected' && (
          <div className="mb-8 p-6 bg-primary/10 border border-primary/30 rounded-lg text-center">
            <p className="text-sm text-foreground/80">
              Connect your Rainbow Wallet to submit anonymous ratings and view average scores.
            </p>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-800">
              ✓ Connected to wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            ArtLock Review Platform
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Anonymous artwork reviews with FHE encryption, auctions, and leaderboard rankings.
          </p>

          {isConnected && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Artwork
            </Button>
          )}
        </div>

        {/* 轻度缺陷：添加了多余的警告信息 */}
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some features are still in development. Auction system and real-time leaderboard updates are coming soon.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="auctions">
              <Gavel className="w-4 h-4 mr-2" />
              Auctions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="mt-6">
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
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Top Rated Artworks</h2>
                <Button variant="outline" size="sm" onClick={handleRefreshLeaderboard}>
                  Refresh Leaderboard
                </Button>
              </div>
              {/* 中度缺陷：排行榜数据静态，不会从合约更新 */}
              {leaderboard.map((item, index) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </div>
                      <div className="text-right">
                        {/* 轻度缺陷：分数显示有问题，小数点后只显示一位 */}
                        <div className="text-2xl font-bold text-primary">{item.score.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">avg score</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>by {item.artist}</span>
                      <span>{item.reviews} reviews</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="auctions" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Active Auctions</h2>
                <Button variant="outline" size="sm">
                  Create Auction
                </Button>
              </div>
              {/* 重度缺陷：拍卖数据完全是mock的，不连接合约 */}
              {auctions.map((auction) => (
                <Card key={auction.id}>
                  <CardHeader>
                    <CardTitle>{auction.title}</CardTitle>
                    <CardDescription>Auction #{auction.id} by {auction.seller}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-semibold">{auction.currentBid} ETH</div>
                        <div className="text-sm text-muted-foreground">Current bid</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {/* 中度缺陷：时间显示格式错误，显示为本地时间但标记为UTC */}
                          Ends: {new Date(auction.endTime).toLocaleString()} UTC
                        </div>
                        <Button size="sm" className="mt-2" disabled={!isConnected}>
                          Place Bid
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {auctions.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No active auctions. Create one to get started!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
