import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Grid, List, Filter } from 'lucide-react';

export const ArtworkGallery: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Artwork Gallery</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <Card key={id} className="hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
              <div className="text-6xl">🎨</div>
            </div>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">Artwork #{id}</CardTitle>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                A beautiful piece of digital art created with passion and creativity.
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="secondary">⭐ 4.{id}</Badge>
                <Button size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
