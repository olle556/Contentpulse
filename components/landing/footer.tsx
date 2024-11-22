import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-gray-950">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto py-12 md:py-16">
        {/* Top Section with Logo and Description */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Content Pulse</span>
            </Link>
            <p className="text-sm text-gray-400">
              Automate your content strategy with powerful AI tools.
            </p>
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Product Column */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="#features" 
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="#pricing" 
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="#about" 
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">Socials</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookie" 
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Content Pulse. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}