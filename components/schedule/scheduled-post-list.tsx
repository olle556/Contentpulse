"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ContentScheduler } from "./content-scheduler";
//import { ContentSchedule } from "@/types";

// Update the type to match your Prisma schema
//  type ContentSchedule = {
//    id: string;
//    contentSourceId: string;
//    platforms: string[];
//    date: Date;
//    time: string;
//    tonality: string;
//    isRecurring: boolean;
//    recurringDays: string[];
//    aiInstructions: string;
//  };

type ContentSchedule = {
  id: string;
  userId: string;
  contentSourceId: string;
  platforms: string[];
  date: Date;
  time: string;
  tonality: string;
  isRecurring: boolean;
  recurringDays: string[];
  aiInstructions: string;
  startDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Add this type to help with the content source mapping
type ContentSource = {
  id: string
  url: string
  category: string
}

export function ScheduledPostList() {
  const [schedules, setSchedules] = useState<ContentSchedule[]>([]);
  const [contentSources, setContentSources] = useState<ContentSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleToEdit, setScheduleToEdit] = useState<ContentSchedule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchContentSources();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedule');
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContentSources = async () => {
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      if (data.success) {
        setContentSources(data.sources);
      }
    } catch (error) {
      console.error('Error fetching content sources:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete schedule');
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleEdit = (schedule: ContentSchedule) => {
    setScheduleToEdit(schedule);
  };

  const handleScheduleUpdate = () => {
    fetchSchedules();
  };

  // Find the corresponding content source URL
  const getContentSourceUrl = (sourceId: string) => {
    const source = contentSources.find(source => source.id === sourceId);
    return source?.url || 'Unknown Source';
  };

  if (schedules.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No schedules generated yet. Click &quot;Generate New Schedule&quot; to get started.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Calendar className="h-5 w-5" />
          <h2 className="text-xl font-semibold ml-2">Scheduled Content</h2>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content Source</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Tonality</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>AI Instructions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{getContentSourceUrl(schedule.contentSourceId)}</TableCell>
                  <TableCell>{schedule.platforms.join(", ")}</TableCell>
                  <TableCell>{schedule.tonality || "Default"}</TableCell>
                  <TableCell>
                    {schedule.date ? format(new Date(schedule.date), "MMM dd") : "N/A"}
                  </TableCell>
                  <TableCell>{schedule.time || "N/A"}</TableCell>
                  <TableCell>
                    {schedule.isRecurring 
                      ? schedule.recurringDays.join(", ")
                      : "No"}
                  </TableCell>
                  <TableCell>{schedule.aiInstructions ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <ContentScheduler
        open={isCreating}
        onOpenChange={(open) => setIsCreating(open)}
        contentSources={contentSources}
        onScheduleUpdate={handleScheduleUpdate}
      />
      {scheduleToEdit && (
        <ContentScheduler
          open={!!scheduleToEdit}
          onOpenChange={(open) => !open && setScheduleToEdit(null)}
          contentSources={contentSources}
          editSchedule={scheduleToEdit}
          onScheduleUpdate={handleScheduleUpdate}
        />
      )}
    </Card>
  );
}