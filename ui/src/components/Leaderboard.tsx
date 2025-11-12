import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  title: string;
  artist: string;
  score: number;
  reviews: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  onRefresh,
  isLoading = false
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Top Rated Artworks
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No artworks rated yet. Be the first to submit a review!
            </p>
          </CardContent>
        </Card>
      ) : (
        entries.map((entry, index) => (
          <Card key={entry.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      index === 0 ? "default" :
                      index === 1 ? "secondary" :
                      "outline"
                    }
                    className={
                      index === 0 ? "bg-yellow-500 hover:bg-yellow-600" :
                      index === 1 ? "bg-gray-400 hover:bg-gray-500" :
                      ""
                    }
                  >
                    #{index + 1}
                  </Badge>
                  <div>
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <CardDescription>by {entry.artist}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {entry.score.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.reviews} reviews
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  );
};
