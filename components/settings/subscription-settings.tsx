'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
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

interface SubscriptionSettingsProps {
  stripeCustomerId?: string | null;
  userId?: string;
}

interface SubscriptionStatus {
  authorized: boolean;
  status: string;
  message: string;
  needsPaymentMethod: boolean;
  trialEndDate: string | null;
  subscriptionEndDate: string | null;
  subscriptionStartDate: string | null;
  remainingTrialDays: number;
  debug?: {
    userId: string;
    subscriptionStatus: string;
    stripeSubscriptionId: string | null;
    checked: boolean;
  };
}

export function SubscriptionSettings({
  stripeCustomerId,
  userId,
}: SubscriptionSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionStatus | null>(null);
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_BASE_URL || '', []);

  // Dialog state variables
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showActiveSubscriptionWarning, setShowActiveSubscriptionWarning] = useState(false);

  // Fetch subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/check-subscription`);
        const data = await response.json();
        console.log('Subscription data:', data);
        setSubscriptionData(data);
      } catch (error) {
        console.error('Error checking subscription:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription status",
          variant: "destructive",
        });
      }
    };
    checkSubscription();
  }, [baseUrl, toast]);

  // Computed states based on subscription data
  const isSubscribed = subscriptionData?.status === 'active';
  const isTrialActive = subscriptionData?.status === 'trial';
  const isInGracePeriod = subscriptionData?.status === 'grace_period';
  const isCanceled = subscriptionData?.status === 'canceled';
  const isPastDue = subscriptionData?.status === 'past_due';
  const isExpired = subscriptionData?.status === 'expired';
  const isTrialEnded = subscriptionData?.status === 'trial_ended';
  const needsPaymentMethod = subscriptionData?.needsPaymentMethod;

  // Add this helper function at the top of the component
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render subscription status message
  const renderSubscriptionStatus = () => {
    if (!subscriptionData) return null;

    switch (subscriptionData.status) {
      case 'trialing':
        return (
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/50">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Trial Active
                </p>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                  {subscriptionData.remainingTrialDays} days left
                </span>
              </div>
              
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Trial ends on {subscriptionData.trialEndDate ? 
                  formatDate(subscriptionData.trialEndDate) : 'N/A'}
              </p>

              {/* Show different messages based on payment method status */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  {subscriptionData.needsPaymentMethod ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Please add a payment method to continue after your trial ends
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Payment method added - You're all set for when your trial ends
                      </p>
                    </>
                  )}
                </div>
                {subscriptionData.needsPaymentMethod && (
                  <Button
                    onClick={handleSubscriptionChange}
                    variant="default"
                    size="sm"
                    className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Payment Method
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case 'active':
        return (
          <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/50">
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-green-800 dark:text-green-200">
                Subscription active until {subscriptionData.subscriptionEndDate ? 
                  formatDate(subscriptionData.subscriptionEndDate) : 'N/A'}
              </p>
            </div>
          </div>
        );

      case 'grace_period':
        return (
          <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/50">
            <div className="flex items-start space-x-3">
              <Receipt className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Subscription Canceled
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Access until {subscriptionData.subscriptionEndDate ? 
                    formatDate(subscriptionData.subscriptionEndDate) : 'N/A'}
                </p>
                <Button
                  onClick={handleSubscriptionChange}
                  variant="outline"
                  size="sm"
                  className="mt-2 w-fit bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                >
                  Reactivate Subscription
                </Button>
              </div>
            </div>
          </div>
        );

      case 'canceled':
      case 'expired':
      case 'trial_ended':
        return (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/50">
            <div className="flex items-start space-x-3">
              <Receipt className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {subscriptionData.status === 'trial_ended' ? 'Trial Ended' : 'Subscription Expired'}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {subscriptionData.message}
                </p>
                <Button
                  onClick={handleSubscriptionChange}
                  variant="outline"
                  size="sm"
                  className="mt-2 w-fit bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  {subscriptionData.status === 'trial_ended' ? 'Subscribe Now' : 'Renew Subscription'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'past_due':
        return (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/50">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Payment Past Due
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {subscriptionData.message}
                </p>
                <Button
                  onClick={handleSubscriptionChange}
                  variant="outline"
                  size="sm"
                  className="mt-2 w-fit"
                >
                  Update Payment Method
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {subscriptionData.message}
            </p>
          </div>
        );
    }
  };

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
      if (isSubscribed && subscriptionData?.status && 
          !['canceled', 'active_until_period_end'].includes(subscriptionData.status)) {
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
          {subscriptionData?.status && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isTrialActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              isSubscribed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              isInGracePeriod ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1)}
            </span>
          )}
        </div>
        
        {renderSubscriptionStatus()}

        {/* Manage Subscription Button */}
        {subscriptionData && !isInGracePeriod && !isCanceled && !isExpired && !isTrialEnded && (
          <div className="space-y-4 mt-4">
            <Button
              onClick={handleSubscriptionChange}
              disabled={isLoading}
              variant={subscriptionData.status === 'inactive' ? "default" : "outline"}
              className={subscriptionData.status === 'inactive' ? 
                "bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200" : 
                ""}
            >
              {isLoading ? "Loading..." : subscriptionData.status === 'inactive' ? "Subscribe" : "Manage Subscription"}
            </Button>
          </div>
        )}
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