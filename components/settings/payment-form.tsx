'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function PaymentForm({ 
  subscriptionStatus,
  stripeCustomerId 
}: { 
  subscriptionStatus?: string | null;
  stripeCustomerId?: string | null;
}) {
  const { toast } = useToast();

  const handleSubscription = async () => {
    try {
      if (stripeCustomerId) {
        // Open customer portal for existing customers
        const response = await fetch('/api/stripe/create-portal', {
          method: 'POST',
        });
        const { url } = await response.json();
        window.location.href = url;
      } else {
        // New subscription
        window.location.href = 'https://buy.stripe.com/test_eVa17CfX90fXdr25kk';
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <Button onClick={handleSubscription}>
      {stripeCustomerId ? 'Manage Billing' : 'Subscribe'}
    </Button>
  );
}