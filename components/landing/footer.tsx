import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white rounded-t-lg">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto py-12 md:py-16">
        {/* Top Section with Logo and Description */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-12">
          <div className="max-w-sm md:max-w-md lg:max-w-lg text-center">
            <Link href="/" className="flex items-center gap-2 mb-4 justify-center">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-black" />
              <span className="text-2xl md:text-3xl font-bold text-black">Content Pulse</span>
            </Link>
            <p className="text-xs md:text-sm text-gray-600 max-w-[250px] md:max-w-none">
              Automate your content strategy!
            </p>
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-8 md:gap-12 mb-12 text-center sm:text-left">
          <div>
            <h3 className="text-sm font-semibold mb-4 text-black">
              Made by <a href="https://coove.studio" className="hover:text-gray-600 transition-colors duration-200">Coove Studio</a>
            </h3>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Content Pulse
            </p>
            <p className="text-sm text-gray-600">
              <a href="mailto:hello@coove.studio" className="hover:text-gray-900 transition-colors duration-200">
                hello@coove.studio
              </a>
            </p>
            <p className="text-sm text-gray-600">
              All rights reserved
            </p>
            <p className="text-sm text-gray-600">
              Flyingbox AB
            </p>
          </div>
          {/* Product Column */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-black">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-black">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}