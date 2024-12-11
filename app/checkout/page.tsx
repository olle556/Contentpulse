"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const initiateCheckout = async () => {
            if (!session?.user) {
                toast({
                    title: "Authentication required",
                    description: "Please sign in to subscribe.",
                    variant: "destructive",
                });
                router.push('/authentication/signup');
                return;
            }

            try {
                const response = await fetch('/api/stripe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ interval: 'month' }), // Default to monthly plan
                });

                const { sessionId } = await response.json();

                if (!response.ok) {
                    throw new Error(sessionId.error || 'Failed to create checkout session');
                }

                const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

                if (!stripe) {
                    throw new Error('Stripe failed to initialize');
                }

                const result = await stripe.redirectToCheckout({ sessionId });

                if (result.error) {
                    throw new Error(result.error.message);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to initiate checkout. Please try again.",
                    variant: "destructive",
                });
                console.error('Checkout error:', error);
                router.push('/settings');
            }
        };

        initiateCheckout();
    }, [session, router, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Setting up your trial...</h2>
                <p className="text-muted-foreground mt-2">Please wait while we redirect you to checkout.</p>
            </div>
        </div>
    );
}