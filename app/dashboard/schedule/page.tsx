"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { SchedulePostDialog } from "@/components/schedule/schedule-post-dialog";
import { ScheduledPostList } from "@/components/schedule/scheduled-post-list";

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
      <SchedulePostDialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen} />
    </div>
  );
}

