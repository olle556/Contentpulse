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
                });

                const { sessionId } = await response.json();

                if (!response.ok) {
                    throw new Error('Failed to create checkout session');
                }

                const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
                
                if (!stripe) {
                    throw new Error('Stripe failed to initialize');
                }

                await stripe.redirectToCheckout({ sessionId });
            } catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to initiate checkout",
                    variant: "destructive",
                });
                router.push('/dashboard/settings');
            }
        };

        initiateCheckout();
    }, [session, router, toast]);

    return null; // No UI needed as we're redirecting to Stripe
}