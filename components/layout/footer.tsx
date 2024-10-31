import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} AIPostCrawler. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link 
              href="/privacy" 
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}