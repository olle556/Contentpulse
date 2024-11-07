import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  
  // Hide footer if pathname starts with /dashboard
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-500 text-center sm:text-left w-full sm:w-auto">
            © {new Date().getFullYear()} AIPostCrawler. All rights reserved.
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 items-center w-full sm:w-auto">
            <Link 
              href="/privacy" 
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 text-center w-full sm:w-auto"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 text-center w-full sm:w-auto"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
