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
import { useState, useCallback } from "react";
import { X, Linkedin, Instagram } from "lucide-react";

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
      icon: <X className="h-6 w-6" />,
      connected: false,
    },
    {
      id: "threads",
      name: "Threads",
      icon: <Instagram className="h-6 w-6" />,
      connected: true,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="h-6 w-6" />,
      connected: false,
    },
  
  ]);

  const initiateThreadsAuth = useCallback(() => {
    const FACEBOOK_APP_ID = "3745203395697482";
    const APP_URL = "http://localhost:3000";
    const REDIRECT_URI = `${APP_URL}/api/auth/threads/callback`;

    console.log('InitiateThreadsAuth called with ID:', FACEBOOK_APP_ID);
    console.log('Redirect URI:', REDIRECT_URI);

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?`
      + `client_id=${FACEBOOK_APP_ID}`
      + `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
      + `&scope=threads_basic,threads_content_publish`
      + `&response_type=code`;
    
    console.log('Auth URL:', authUrl);
    
    window.location.href = authUrl;
  }, []);

  const toggleConnection = (platformId: string) => {
    console.log('Toggle connection called for:', platformId);

    if (platformId === 'threads' && !platforms.find(p => p.id === 'threads')?.connected) {
      console.log('Initiating Threads auth...');
      initiateThreadsAuth();
      return;
    }

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
              onCheckedChange={() => {
                console.log('Switch clicked for:', platform.id);
                toggleConnection(platform.id);
              }}
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
                onClick={() => {
                  console.log('Button clicked for:', platform.id);
                  toggleConnection(platform.id);
                }}
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