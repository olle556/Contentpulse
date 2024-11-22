"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Delay the banner appearance slightly for better UX
    const timer = setTimeout(() => {
      const cookieConsent = localStorage.getItem("cookie-consent");
      if (!cookieConsent) {
        setShowBanner(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const acceptCookies = () => {
    const consent = {
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookie-consent", JSON.stringify(consent));
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-lg"
        >
          <div className="container max-w-7xl mx-auto py-4 px-4 md:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-sm text-muted-foreground">
                <p>
                  We use cookies to ensure you get the best experience on our website.
                  These cookies are strictly necessary for the website to function properly.
                  {" "}
                  <Link 
                    href="/cookie" 
                    className="font-medium underline underline-offset-4 hover:text-primary"
                  >
                    Learn more
                  </Link>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={acceptCookies}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Accept & Continue
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={acceptCookies}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}