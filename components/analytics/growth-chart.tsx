"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GrowthChart() {
  const data = [
    {
      date: "Jan",
      twitter: 1200,
      linkedin: 800,
      facebook: 1500,
    },
    {
      date: "Feb",
      twitter: 1400,
      linkedin: 950,
      facebook: 1600,
    },
    {
      date: "Mar",
      twitter: 1600,
      linkedin: 1100,
      facebook: 1750,
    },
    {
      date: "Apr",
      twitter: 1800,
      linkedin: 1300,
      facebook: 1900,
    },
    // Add more months as needed
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Audience Growth</h3>
        <Select defaultValue="3m">
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <XAxis dataKey="date" stroke="#888888" />
          <YAxis stroke="#888888" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="twitter"
            stackId="1"
            stroke="#1DA1F2"
            fill="#1DA1F2"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="linkedin"
            stackId="1"
            stroke="#0A66C2"
            fill="#0A66C2"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="facebook"
            stackId="1"
            stroke="#1877F2"
            fill="#1877F2"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}