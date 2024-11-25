import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        console.log('Customer created:', customer);

        try {
          // Update user with Stripe customer ID
          const updatedUser = await prisma.user.update({
            where: {
              email: customer.email!,
            },
            data: {
              stripeCustomerId: customer.id,
            },
          });
          console.log('Updated user with customer ID:', updatedUser);
        } catch (error) {
          console.error('Error processing customer.created:', error);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session data:', session);

        try {
          if (!session.customer) {
            throw new Error('No customer ID in session');
          }

          const customerId = typeof session.customer === 'string' 
            ? session.customer 
            : session.customer.id;

          // Fetch subscription details
          const subscription = session.subscription 
            ? await stripe.subscriptions.retrieve(session.subscription as string)
            : null;

          console.log('Subscription data:', subscription);

          // Update user record
          const updatedUser = await prisma.user.update({
            where: {
              stripeCustomerId: customerId,
            },
            data: {
              subscriptionStatus: 'active',
              subscriptionEndDate: subscription 
                ? new Date(subscription.current_period_end * 1000)
                : null,
            },
          });

          console.log('Updated user subscription:', updatedUser);
        } catch (error) {
          console.error('Error processing checkout.session.completed:', error);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription event data:', subscription);

        try {
          const updatedUser = await prisma.user.update({
            where: {
              stripeCustomerId: subscription.customer as string,
            },
            data: {
              subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
              subscriptionEndDate: new Date(subscription.current_period_end * 1000),
            },
          });

          console.log('Updated user subscription:', updatedUser);
        } catch (error) {
          console.error('Error processing subscription event:', error);
        }
        break;
      }
    }

    return NextResponse.json({ 
      received: true,
      type: event.type,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Webhook signature verification failed' }), 
      { status: 400 }
    );
  }
}