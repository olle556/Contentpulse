import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, LayoutDashboard, Menu, X, Zap } from "lucide-react";

const navigation = [
  { name: "Features", href: "#features", icon: LayoutDashboard },
  { name: "Pricing", href: "#pricing", icon: BarChart3 },
  { name: "About", href: "#about", icon: FileText },
];

export function Header({ onLogin, onGetStarted }: { onLogin: () => void, onGetStarted: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full pt-2">
      <div className="container flex h-14 md:h-16 items-center justify-between px-2 md:px-4 max-w-full mx-auto">
        <Link className="flex items-center gap-1.5 md:gap-2 font-semibold" href="#">
          <Zap className="h-5 w-5 md:h-6 md:w-6" />
          <span className="text-2xl md:text-3xl">Content Pulse</span>
        </Link>

        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-base lg:text-lg font-medium hover:text-gray-300 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <Button 
            onClick={onLogin} 
            size="lg" 
            variant="outline"
            className="text-base font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-200 px-6 h-11"
            >
            Login
          </Button>
          <Button onClick={onGetStarted} size="lg" className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto text-base lg:text-lg">
            Get Started
          </Button>
        </div>
        
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-" />
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="fixed right-0 top-0 h-full w-64 bg-white">
            <div className="flex justify-end p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-black hover:bg-gray-100 p-1.5"
              >
                <X className="h-5 w-5" />
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
                className="w-full mt-2 bg-transparent hover:bg-white hover:text-black transition-colors border-2 border-white"
              >
                Login
              </Button>
              <Button
                onClick={onGetStarted}
                size="sm"
                className="w-full mt-4 bg-black text-white hover:bg-gray-800">
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}