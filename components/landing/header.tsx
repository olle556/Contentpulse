import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, LayoutDashboard, Menu, X, Zap } from "lucide-react";

const navigation = [
  { name: "Features", href: "#features", icon: LayoutDashboard },
  { name: "Pricing", href: "#pricing", icon: BarChart3 },
  { name: "About", href: "#about", icon: FileText },
];

export function Header({ onLogin }: { onLogin: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-800 w-full">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        <Link className="flex items-center gap-1.5 md:gap-2 font-semibold" href="#">
          <Zap className="h-4 w-4 md:h-6 md:w-6" />
          <span className="text-base md:text-lg">Content Pulse</span>
        </Link>
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium hover:text-gray-300 transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <Button onClick={onLogin} size="sm" className="md:text-sm">
            Login
          </Button>
          <Button className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto">
            Get Started
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-1.5"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="fixed right-0 top-0 h-full w-64 bg-card">
            <div className="flex justify-end p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-2 md:px-3 md:py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                  {item.name}
                </Link>
              ))}
              <Button
                onClick={onLogin}
                size="sm"
                className="w-full mt-4"
              >
                Login
              </Button>
              <Button className="bg-white text-black hover:bg-gray-200 w-full mt-2">
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}