import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let interval;
    try {
      const body = await req.json();
      interval = body.interval;
      
      if (!interval || !['month', 'year'].includes(interval)) {
        return NextResponse.json(
          { error: 'Invalid interval. Must be "month" or "year"' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON with interval parameter.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // First check if user already has a Stripe customer ID
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      // If no customer ID exists, check if customer exists in Stripe by email
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      } as Stripe.CustomerListParams);

      if (existingCustomers.data.length > 0) {
        // Use existing customer if found
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new customer only if one doesn't exist
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;
      }

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = interval === 'year' ? 
      process.env.STRIPE_YEARLY_PRICE_ID : 
      process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      console.error('Missing Stripe price ID:', { interval, priceId });
      return NextResponse.json(
        { 
          error: 'Subscription configuration error. Please contact support.',
          details: 'Missing price configuration'
        },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 7,
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'cancel'
            }
          }
        },
        payment_method_collection: 'if_required',
        allow_promotion_codes: true,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?canceled=true`,
      });

      return NextResponse.json({ sessionId: checkoutSession.id });
    } catch (error) {
      console.error('Stripe checkout session creation error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create checkout session',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}