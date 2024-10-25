"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

export function SourcesBreakdown() {
  const data = [
    { name: "Direct", value: 40 },
    { name: "Search", value: 30 },
    { name: "Referral", value: 20 },
    { name: "Social", value: 10 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}