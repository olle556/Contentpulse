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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'TRIAL_ENDED' 
              ? 'Trial Period Ended' 
              : 'Subscription Required'}
          </DialogTitle>
          <DialogDescription>
            {type === 'TRIAL_ENDED'
              ? 'Your trial period has ended. Please complete your subscription to continue using all features.'
              : 'This feature requires an active subscription.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePortalAccess}>
            Complete Subscription
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}