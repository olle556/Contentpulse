"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function EngagementChart() {
  const data = [
    { date: "Jan", twitter: 4.5, linkedin: 3.8, facebook: 3.2 },
    { date: "Feb", twitter: 4.8, linkedin: 3.9, facebook: 3.4 },
    // Add more data points
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="date" stroke="#888888" />
        <YAxis stroke="#888888" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="twitter"
          stroke="#1DA1F2"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="linkedin"
          stroke="#0A66C2"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="facebook"
          stroke="#1877F2"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}