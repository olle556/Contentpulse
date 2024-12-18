"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidUrl, ensureHttps } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";


interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void>;
}

export function AddSourceDialog({ open, onOpenChange, onSuccess }: AddSourceDialogProps) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log("Session status:", status);
      window.location.href = '/authentication/login';
    },
  });
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (status !== "authenticated" || !session) {
        throw new Error("Not authenticated");
      }

      const formattedUrl = ensureHttps(url);
      
      if (!isValidUrl(formattedUrl)) {
        throw new Error("Invalid URL");
      }

      // Validate URL first
      const validateResponse = await fetch('/api/sources/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formattedUrl }),
        credentials: 'include',
      });

      const validateData = await validateResponse.json();
      
      if (!validateResponse.ok) {
        throw new Error(validateData.error || 'Invalid URL');
      }

      // Proceed with adding the source if validation passed
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formattedUrl }),
        credentials: 'include',
      });

     

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add source');
      }

      if (onSuccess) {
        await onSuccess();
      }
      
      setUrl("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding source:', error);
      
      // Show generic error if not a subscription issue
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add source",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Content Source</DialogTitle>
          <DialogDescription>
            We currently don&apos;t support social media sources.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Source"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
