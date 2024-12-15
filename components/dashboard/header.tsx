"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showUpgradeButton, setShowUpgradeButton] = useState(false);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/check-subscription_2/check-trialstatus');
          const data = await response.json();
          
          // Show upgrade button if user is in trial period
          setShowUpgradeButton(data.status === 'trial');
        } catch (error) {
          console.error('Error checking trial status:', error);
        }
      }
    };

    checkTrialStatus();
  }, [session]);

  const handleSignOut = async () => {
    try {
      // First navigate to home page
      router.push('/');
      
      // Then sign out without redirect
      await signOut({ 
        redirect: false
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback if the above fails
      window.location.href = '/';
    }
  };

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-medium">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        {showUpgradeButton && (
          <Button
            variant="default"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            onClick={() => router.push('/dashboard/settings')}
          >
            Upgrade Now
          </Button>
        )}
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {session?.user?.image && (
                  <img src={session.user.image} alt={session.user?.name || 'User avatar'} />
                )}
                <AvatarFallback>
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
