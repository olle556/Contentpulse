"use client";

import { useState } from "react";
import useSWR from 'swr';
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { ScheduledPostList } from "@/components/schedule/scheduled-post-list";
import { ContentScheduler } from "@/components/schedule/content-scheduler";
import { useOnboarding } from "@/hooks/use-onboarding";

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
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const shortText = "Schedule automatic post generations for your social media content.";
  const fullText = "Schedule automatic post generations for your social media content. Each generation uses the latest data from your content sources, and the generated posts will be delivered directly to your email for easy sharing.";

  const { data: contentSources, error, isLoading } = useSWR('/api/sources', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
    refreshInterval: 0,
    keepPreviousData: true,
  });

  const handleScheduleUpdate = async () => {
    setRefreshTrigger(prev => prev + 1);
    await markStepCompleted('schedule');
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-left">
          Scheduled Post Generations
        </h1>
        <Button
          onClick={() => setIsScheduleOpen(true)}
          className="w-full md:w-auto"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Generation
        </Button>
      </div>

      <div className="text-muted-foreground text-left">
        {/* Desktop version */}
        <p className="hidden md:block">
          {fullText}
        </p>

        {/* Mobile version */}
        <div className="md:hidden">
          <p>{isTextExpanded ? fullText : shortText}</p>
          <Button 
            variant="ghost" 
            className="mt-2 h-8 px-2 text-xs"
            onClick={() => setIsTextExpanded(!isTextExpanded)}
          >
            {isTextExpanded ? (
              <div className="flex items-center">
                Show Less <ChevronUp className="ml-1 h-4 w-4" />
              </div>
            ) : (
              <div className="flex items-center">
                Show More <ChevronDown className="ml-1 h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
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

