'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreditCard, Receipt, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";
import { deleteUser } from "@/lib/deleteUser";
import { getStripe } from "@/lib/stripe";

interface SubscriptionSettingsProps {
  stripeCustomerId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionEndDate?: Date | null;
  userId?: string;
}

export function SubscriptionSettings({
  stripeCustomerId,
  subscriptionStatus: initialStatus,
  subscriptionEndDate: initialEndDate,
  userId,
}: SubscriptionSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(initialStatus);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(
    initialEndDate ? new Date(initialEndDate) : null
  );
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showActiveSubscriptionWarning, setShowActiveSubscriptionWarning] = useState(false);
  const [trialStatus, setTrialStatus] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);

  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_BASE_URL || '', []);

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/check-subscription_2/check-trialstatus`);
        const data = await response.json();
        setTrialStatus(data.status);
        setTrialEndDate(data.trialEndDate ? new Date(data.trialEndDate) : null);
      } catch (error) {
        console.error('Error checking trial status:', error);
      }
    };
    checkTrialStatus();
  }, [baseUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const subscription = params.get('subscription');

    if (success === 'true' && subscription === 'active') {
      // Update subscription status to reflect the new trial/subscription
      setSubscriptionStatus('active');
      
      // Set trial status if it's a trial subscription
      setTrialStatus('trial');
      
      // Set trial end date to 7 days from now (since that's your trial period)
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      setTrialEndDate(trialEnd);

      // Clear the URL parameters
      window.history.replaceState({}, '', '/dashboard/settings');
      
      // Show a success toast (optional)
      toast({
        title: "Success!",
        description: "Your subscription has been activated.",
      });
    }
  }, [toast]);

  const isSubscribed = subscriptionStatus === 'active';
  const isCanceled = subscriptionStatus === 'canceled' || subscriptionStatus === 'active_until_period_end';
  const isInactive = subscriptionStatus === 'inactive' || (!subscriptionStatus && !trialStatus);
  const isTrialPeriod = trialStatus === 'trial';

  const hasActiveSubscriptionOrTrial = isSubscribed || isTrialPeriod;

  const handlePortalAccess = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/stripe/create-portal`, {
        method: 'POST',
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access billing portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubscriptionChange = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/stripe/create-portal`, {
        method: 'POST',
      });
      const data = await response.json();

      // If we get a 403, redirect to pricing
      if (response.status === 403) {
        window.location.href = '/#pricing';
        return;
      }

      // If response is not ok and not 403, throw error
      if (!response.ok) {
        throw new Error(data.error || 'Failed to access billing portal');
      }

      // If we have a valid portal URL, redirect to it
      if (data.url) {
        window.location.href = data.url;
      }
      
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to manage subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Check for active subscription
      if (isSubscribed && subscriptionStatus && 
          !['canceled', 'active_until_period_end'].includes(subscriptionStatus)) {
        setShowActiveSubscriptionWarning(true);
        return;
      }

      // Close the confirmation dialog
      setShowDeleteConfirmation(false);

      // Delete the account
      const result = await deleteUser(userId);
      
      if (result.success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted.",
        });
        
        // Sign out and redirect directly to home page
        // Use replace: true to prevent back navigation
        await signOut({ 
          redirect: true,
          callbackUrl: '/' 
        });
      } else {
        throw new Error(result.error || 'Failed to delete account');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Subscription Status</h3>
          {(isTrialPeriod || isSubscribed) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Active
            </span>
          )}
          {isCanceled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Paused
            </span>
          )}
        </div>
        
        {/* Active Subscription Message */}
        {isSubscribed && !isTrialPeriod && subscriptionEndDate && (
          <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/50">
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Your subscription is active. Next billing date:{' '}
                <span className="font-medium">
                  {subscriptionEndDate.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Active Trial Message */}
        {isTrialPeriod && trialEndDate && !isCanceled && (
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/50">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  You&apos;re currently on a trial period with {' '}
                  <span className="font-medium">
                    {Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>{' '}
                  remaining.
                </p>
              </div>
            </div>
            
            {/* Payment Method Reminder */}
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/50">
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Add a payment method
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    To continue using the app after your trial ends, please add a payment method. Your card won&apos;t be charged until your trial expires.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paused Trial Message */}
        {isCanceled && subscriptionEndDate && (
          <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/50">
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your trial is currently paused. You have until{' '}
                <span className="font-medium">
                  {subscriptionEndDate.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>{' '}
                to reactivate your trial.
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                After this date, you&apos;ll need to start a new subscription to access premium features.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-4">
          <Button
            onClick={handleSubscriptionChange}
            disabled={isLoading}
            variant={isCanceled ? "default" : "outline"}
            className={isCanceled ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}
          >
            {isLoading ? "Loading..." : 
              (isCanceled ? "Reactivate Trial" : "Manage Billing")}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Management</h3>
        <Button 
          variant="destructive" 
          onClick={() => setShowDeleteConfirmation(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until the end of the current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handlePortalAccess}>
              Continue to Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              All of your information will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showActiveSubscriptionWarning} onOpenChange={setShowActiveSubscriptionWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Active Subscription Detected</AlertDialogTitle>
            <AlertDialogDescription>
              You have an active subscription. Please cancel your subscription before deleting your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowActiveSubscriptionWarning(false);
              handlePortalAccess(); // Redirect to Stripe portal to cancel subscription
            }}>
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}