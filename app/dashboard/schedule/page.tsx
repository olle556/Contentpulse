"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { ScheduledPostList } from "@/components/schedule/scheduled-post-list";
import { ContentScheduler } from "@/components/schedule/content-scheduler";

export default function SchedulePage() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [contentSources, setContentSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchContentSources = async () => {
      try {
        const response = await fetch('/api/sources');
        const data = await response.json();
        
        if (data.success) {
          setContentSources(data.sources);
        } else {
          console.error('Failed to fetch sources:', data.error);
        }
      } catch (error) {
        console.error('Failed to fetch sources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentSources();
  }, []);

  const handleScheduleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scheduled Post Generations</h1>
        <Button 
          onClick={() => setIsScheduleOpen(true)}
          disabled={contentSources.length === 0}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Generation
        </Button>
      </div>

      <ScheduledPostList key={refreshTrigger} />
      {!loading && (
        <ContentScheduler 
          open={isScheduleOpen} 
          onOpenChange={setIsScheduleOpen}
          contentSources={contentSources}
          onScheduleUpdate={handleScheduleUpdate}
        />
      )}
    </div>
  );
}

