"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// You'll want to move this to your types file
type ScheduledPost = {
  id: string;
  title: string;
  platform: string;
  scheduledDate: Date;
  scheduledTime: string;
};

export function ScheduledPostList() {
  // This is mock data - replace with your actual data fetching logic
  const scheduledPosts: ScheduledPost[] = [
    {
      id: "1",
      title: "10 Tips for Better Programming",
      platform: "Twitter",
      scheduledDate: new Date("2024-03-25"),
      scheduledTime: "09:00",
    },
    // Add more mock posts as needed
  ];

  const handleDelete = (id: string) => {
    // Implement delete functionality
    console.log("Delete post:", id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Upcoming Posts</h2>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post Title</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.platform}</TableCell>
                <TableCell>{format(post.scheduledDate, "MMM dd, yyyy")}</TableCell>
                <TableCell>{post.scheduledTime}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}