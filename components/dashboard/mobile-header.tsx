"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { Sidebar } from "./sidebar";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
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
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <header className="h-14 border-b bg-card px-4 flex items-center justify-between">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="font-semibold">Content Pulse</div>
      
      <div className="flex items-center gap-2">
        {showUpgradeButton && (
          <Button
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            onClick={() => router.push('/dashboard/settings')}
          >
            Upgrade
          </Button>
        )}
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {session?.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile picture"
                    className="h-full w-full object-cover"
                  />
                )}
                <AvatarFallback>CP</AvatarFallback>
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