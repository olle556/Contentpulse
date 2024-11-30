'use client';

import { useState, useEffect } from "react";
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

  const isSubscribed = subscriptionStatus === 'active';
  const isCanceled = subscriptionStatus === 'canceled' || subscriptionStatus === 'active_until_period_end';

  const handlePortalAccess = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal', {
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
      if (stripeCustomerId) {
        // Existing customer - open portal
        await handlePortalAccess();
      } else {
        // New subscription
        window.location.href = 'https://buy.stripe.com/test_eVa17CfX90fXdr25kk';
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to manage subscription. Please try again.",
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

    // Check if user has active subscription
    if (isSubscribed && subscriptionStatus && 
        !['canceled', 'active_until_period_end'].includes(subscriptionStatus)) {
      setShowActiveSubscriptionWarning(true);
      return;
    }

    // Proceed with account deletion
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted.",
        });
        signOut({ callbackUrl: '/' });
      } else {
        throw new Error(result.error || 'Failed to delete account');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Subscription Status</h3>
        <p className="text-sm text-muted-foreground">
          Status: {isCanceled ? 'Cancelled' : subscriptionStatus || 'No active subscription'}
        </p>
        {subscriptionEndDate && (
          <p className="text-sm text-muted-foreground">
            {isSubscribed
              ? `Next billing date: ${subscriptionEndDate.toLocaleDateString()}`
              : `Subscription paid until: ${subscriptionEndDate.toLocaleDateString()}`}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {stripeCustomerId ? (
          <>
            <Button
              onClick={handlePortalAccess}
              className="w-full"
              variant="outline"
            >
              <Receipt className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          </>
        ) : (
          <Button
            onClick={handleSubscriptionChange}
            className="w-full"
            variant="default"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Subscribe Now
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Management</h3>
        <Button 
          variant="destructive" 
          className="w-full"
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>Delete Account</AlertDialogAction>
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