import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Plus, Upload, Eye, BarChart3 } from 'lucide-react';

export const ArtistDashboard: React.FC = () => {
  const [newArtwork, setNewArtwork] = useState({
    title: '',
    description: '',
  });

  const handleCreateArtwork = () => {
    // Implementation for creating artwork
    console.log('Creating artwork:', newArtwork);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Artist Dashboard</h1>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Artwork
        </Button>
      </div>

      {/* Artwork Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Artwork</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={newArtwork.title}
              onChange={(e) => setNewArtwork(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter artwork title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={newArtwork.description}
              onChange={(e) => setNewArtwork(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your artwork"
              rows={4}
            />
          </div>
          <Button onClick={handleCreateArtwork} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Create Artwork
          </Button>
        </CardContent>
      </Card>

      {/* Artwork Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock artwork cards */}
        {[1, 2, 3].map((id) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle className="text-lg">Artwork #{id}</CardTitle>
              <Badge variant="secondary">Active</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sample artwork description for display purposes.
              </p>
              <div className="flex justify-between text-sm">
                <span>Reviews: 5</span>
                <span>Avg Rating: 8.2</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
