"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';

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

      const response = await fetch('/api/create-checkout-session', {
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
    <Card className={`relative flex flex-col h-full w-full text-white pb-6 ${className} bg-gradient-to-r from-purple-800 to-indigo-900`}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div>
          <div className="text-center mb-6">
            <span className="text-5xl font-bold">${displayPrice}</span>
            <span className="text-xl">{interval}</span>
          </div>
          <Button 
            className="w-full bg-white text-gray-900 hover:bg-gray-100 mb-6"
            onClick={handleSubscribe}
          >
            {buttonText}
          </Button>
          <div className="text-xs text-center mb-6">Secured by Stripe</div>
          <ul className="space-y-3 mb-6 text-sm">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export { PricingCard };