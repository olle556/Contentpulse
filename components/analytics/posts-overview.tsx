"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PostsOverview() {
  const data = [
    {
      name: "Mon",
      posts: 4,
      engagement: 420,
    },
    {
      name: "Tue",
      posts: 3,
      engagement: 380,
    },
    {
      name: "Wed",
      posts: 5,
      engagement: 520,
    },
    {
      name: "Thu",
      posts: 2,
      engagement: 280,
    },
    {
      name: "Fri",
      posts: 4,
      engagement: 450,
    },
    {
      name: "Sat",
      posts: 3,
      engagement: 390,
    },
    {
      name: "Sun",
      posts: 2,
      engagement: 250,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Posts Performance</h3>
          <p className="text-sm text-muted-foreground">
            Number of posts and engagement by day
          </p>
        </div>
        <Select defaultValue="7d">
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="14d">Last 14 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Bar
            dataKey="posts"
            fill="#adfa1d"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="engagement"
            fill="#0ea5e9"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Total Posts</p>
          <p className="text-2xl font-bold">23</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Avg. Engagement</p>
          <p className="text-2xl font-bold">384</p>
        </div>
      </div>
    </div>
  );
}