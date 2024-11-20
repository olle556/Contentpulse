"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Settings,
  Link as LinkIcon,
  PenTool,
  Calendar,
  LayoutDashboard,
  Palette,
  MessageCircle,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Your Brand", href: "/dashboard/brand", icon: Palette },
  { name: "Content Sources", href: "/dashboard/sources", icon: LinkIcon },
  { name: "Generated Posts", href: "/dashboard/posts", icon: PenTool },
  { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Contact", href: "/dashboard/contact", icon: MessageCircle },
];

export function Sidebar({ mobile, onNavigate }: { mobile?: boolean, onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card">
      {!mobile && (
        <div className="flex h-14 md:h-16 items-center px-4 md:px-6">
          <Link href="/dashboard" className="text-lg md:text-xl font-bold">
            Content Pulse
          </Link>
        </div>
      )}
      <nav className="flex-1 space-y-1 p-2 md:px-3 md:py-4 pt-12">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
