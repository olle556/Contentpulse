"use client";

import { useState } from "react";
import useSWR from 'swr';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { ScheduledPostList } from "@/components/schedule/scheduled-post-list";
import { ContentScheduler } from "@/components/schedule/content-scheduler";
import { useOnboarding } from "@/hooks/use-onboarding";

// Add this fetcher function outside the component
const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.sources;
};

export default function SchedulePage() {
  const { markStepCompleted } = useOnboarding();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Updated SWR configuration with caching options
  const { data: contentSources, error, isLoading } = useSWR('/api/sources', fetcher, {
    revalidateOnFocus: false,    // Prevent revalidation when window focuses
    revalidateOnReconnect: false, // Prevent revalidation on reconnect
    dedupingInterval: 60000,     // Dedupe requests within 1 minute
    refreshInterval: 0,          // Disable automatic refresh
    keepPreviousData: true,      // Keep showing previous data while fetching
  });

  const handleScheduleUpdate = async () => {
    setRefreshTrigger(prev => prev + 1);
    await markStepCompleted('schedule');
  };

  return (
    <div className="space-y-6 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full">
          Scheduled Post Generations
        </h1>
        <Button 
          onClick={() => setIsScheduleOpen(true)}
          //disabled={contentSources.length === 0}
          className="w-full sm:w-auto"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Generation
        </Button>
      </div>

      <ScheduledPostList key={refreshTrigger} />
      {!isLoading && (
        <ContentScheduler 
          open={isScheduleOpen} 
          onOpenChange={setIsScheduleOpen}
          contentSources={contentSources || []}
          onScheduleUpdate={handleScheduleUpdate}
        />
      )}
    </div>
  );
}

