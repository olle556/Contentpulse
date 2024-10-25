"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter, Linkedin, Facebook, TrendingUp } from "lucide-react";

export function PlatformStats() {
  const stats = [
    {
      title: "Twitter",
      stats: "2,345",
      change: "+12.3%",
      icon: Twitter,
    },
    {
      title: "LinkedIn",
      stats: "1,234",
      change: "+8.1%",
      icon: Linkedin,
    },
    {
      title: "Facebook",
      stats: "3,456",
      change: "+5.4%",
      icon: Facebook,
    },
    {
      title: "Total Reach",
      stats: "7,035",
      change: "+9.2%",
      icon: TrendingUp,
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.stats}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">{stat.change}</span> from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}