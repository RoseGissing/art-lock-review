import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MessageSquare, History, Star, TrendingUp } from 'lucide-react';

export const ReviewerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reviewer Dashboard</h1>
        <div className="flex gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            <Star className="w-4 h-4 mr-1" />
            Trusted Reviewer
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            47 Reviews
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="completed">Review History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {[1, 2, 3].map((id) => (
              <Card key={id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Artwork #{id}</h3>
                      <p className="text-sm text-muted-foreground">by Artist Name</p>
                      <p className="text-sm mt-2">Ready for your expert review</p>
                    </div>
                    <Button>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Review Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((id) => (
              <Card key={id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Artwork #{id}</h3>
                      <p className="text-sm text-muted-foreground">Reviewed on Nov {id + 10}, 2025</p>
                      <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">Rating: {7 + id % 3}</span>
                      </div>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">47</div>
                <p className="text-sm text-muted-foreground">+12 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8.2</div>
                <p className="text-sm text-muted-foreground">+0.3 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reputation Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">95</div>
                <p className="text-sm text-muted-foreground">Top 5% of reviewers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
