"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EngagementChart } from "@/components/analytics/engagement-chart";
import { GrowthChart } from "@/components/analytics/growth-chart";
import { PlatformStats } from "@/components/analytics/platform-stats";
import { TopPosts } from "@/components/analytics/top-posts";
import { PostsOverview } from "@/components/analytics/posts-overview";
import { SourcesBreakdown } from "@/components/analytics/sources-breakdown";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Overview</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PlatformStats />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <EngagementChart />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <TopPosts />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Posts Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <PostsOverview />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <SourcesBreakdown />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* Detailed engagement metrics */}
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          {/* Audience growth metrics */}
        </TabsContent>
      </Tabs>
    </div>
  );
}