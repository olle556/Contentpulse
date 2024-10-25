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
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Content Sources", href: "/dashboard/sources", icon: LinkIcon },
  { name: "Generated Posts", href: "/dashboard/posts", icon: PenTool },
  { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-xl font-bold">
          Content Pulse
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
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