"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
}

export function IntegrationSettings() {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "twitter",
      name: "Twitter",
      icon: <Twitter className="h-6 w-6" />,
      connected: false,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="h-6 w-6" />,
      connected: true,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="h-6 w-6" />,
      connected: false,
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: <Youtube className="h-6 w-6" />,
      connected: false,
    },
  ]);

  const toggleConnection = (platformId: string) => {
    setPlatforms(platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, connected: !platform.connected }
        : platform
    ));
  };

  return (
    <div className="space-y-6">
      {platforms.map((platform) => (
        <Card key={platform.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              {platform.icon}
              <CardTitle>{platform.name}</CardTitle>
            </div>
            <Switch
              checked={platform.connected}
              onCheckedChange={() => toggleConnection(platform.id)}
            />
          </CardHeader>
          <CardContent>
            <CardDescription>
              {platform.connected 
                ? `Connected to ${platform.name}. You can now post content directly.`
                : `Connect your ${platform.name} account to start posting content.`}
            </CardDescription>
            <div className="mt-4">
              <Button
                variant={platform.connected ? "destructive" : "secondary"}
                onClick={() => toggleConnection(platform.id)}
              >
                {platform.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}