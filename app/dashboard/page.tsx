"use client";

import { useEffect, useState } from "react";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Activity, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [postsCount, setPostsCount] = useState<string>("--");
  const [sourcesCount, setSourcesCount] = useState<string>("--");
  const [schedulesCount, setSchedulesCount] = useState<string>("--");

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/progress');
        const data = await response.json();
        
        if (data.success) {
          // Hide welcome card if all steps are completed
          setShowWelcome(data.completedSteps.length < 4);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
      
    };

    checkOnboardingStatus();

    const fetchPostsCount = async () => {
      try {
        const response = await fetch('/api/posts/count', {
          cache: 'no-store'
        });
        const data = await response.json();
        
        if (data.success) {
          setPostsCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch posts count:', error);
      }
    };

    fetchPostsCount();

    const fetchSourcesCount = async () => {
      try {
        const response = await fetch('/api/sources/count', {
          cache: 'no-store',
        });
        const data = await response.json();

        if (data.success) {
          setSourcesCount(data.count);
        }
      }
      catch (error) {
        console.error('Failed to fetch sources count:', error);
      }
    };
    
    fetchSourcesCount();

    const fetchSchedulesCount = async () => {
      try {
        const response = await fetch('/api/schedule/count', { cache: 'no-store' });
        const data = await response.json();

        if (data.success) {
          setSchedulesCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch schedules count:', error);
      }
    };

    fetchSchedulesCount();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back</h1>
      
      {showWelcome && <WelcomeCard />}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Posts"
          value={postsCount}
          description="Posts generated"
          icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatsCard
          title="Active Sources"
          value={sourcesCount}
          description="Content sources monitored"
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
        <StatsCard
          title="Active Schedules"
          value={schedulesCount}
          description="Schedules in action"
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
        />
      </div>
    </div>
  );


function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
        <div className="opacity-75">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
      </CardContent>
    </Card>
    );
  }
}
