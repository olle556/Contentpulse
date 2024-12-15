// components/dashboard/subscription-alert.tsx
'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SubscriptionAlert({ 
  isOpen, 
  onClose, 
  type = 'TRIAL_ENDED' 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  type: 'TRIAL_ENDED' | 'NO_SUBSCRIPTION';
}) {
  const handlePortalAccess = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error accessing portal:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {type === 'TRIAL_ENDED' 
              ? 'Trial Period Ended' 
              : 'Subscription Required'}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            {type === 'TRIAL_ENDED'
              ? 'Your trial period has ended. Please complete your subscription to continue using all features.'
              : 'This feature requires an active subscription.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePortalAccess}
            className="dark:bg-primary dark:hover:bg-primary/90 dark:text-white"
          >
            Complete Subscription
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}