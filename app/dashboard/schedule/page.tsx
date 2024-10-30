"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { SchedulePostDialog } from "@/components/schedule/schedule-post-dialog";
import { ScheduledPostList } from "@/components/schedule/scheduled-post-list";
import { ContentScheduler } from "@/components/schedule/content-scheduler";

// Add mock data or fetch from your API
const contentSources = [
  { id: "1", url: "https://example.com/blog1", category: "Blog" },
  { id: "2", url: "https://example.com/blog2", category: "Newsletter" },
];

export default function SchedulePage() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scheduled Posts</h1>
        <Button onClick={() => setIsScheduleOpen(true)}>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      <ScheduledPostList />
      <ContentScheduler 
        open={isScheduleOpen} 
        onOpenChange={setIsScheduleOpen}
        contentSources={contentSources}
      />
    </div>
  );
}

