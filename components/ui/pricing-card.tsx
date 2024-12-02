"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  title: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  buttonText: string;
  className?: string;
  isYearly: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  monthlyPrice,
  yearlyPrice,
  features,
  buttonText,
  className = '',
  isYearly,
}) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const handleSubscribe = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestBody = { 
        interval: isYearly ? 'year' : 'month'
      };

      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { sessionId } = data;

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayPrice = isYearly ? yearlyPrice : monthlyPrice;
  const interval = isYearly ? '/year' : '/month';

  return (
    <Card className={cn(
      "relative flex flex-col h-full w-full border border-border bg-card text-card-foreground",
      className
    )}>
      <CardHeader className="text-center pb-8 pt-6">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between p-6">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-end justify-center">
              <span className="text-5xl font-bold tracking-tight">
                ${displayPrice}
              </span>
              <span className="text-sm font-medium text-muted-foreground ml-2">
                {interval}
              </span>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={handleSubscribe}
          >
            {buttonText}
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            Secured by Stripe
          </div>

          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <Check className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export { PricingCard };