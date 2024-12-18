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

          // Check if this is a trial subscription
          const isTrialSubscription = subscription?.status === 'trialing';
          const trialEnd = subscription?.trial_end 
            ? new Date(subscription.trial_end * 1000)
            : null;

          // Update user record
          const updatedUser = await prisma.user.update({
            where: {
              stripeCustomerId: customerId,
            },
            data: {
              subscriptionStatus: isTrialSubscription ? 'active' : subscription?.status || 'inactive',
              subscriptionEndDate: trialEnd || (subscription 
                ? new Date(subscription.current_period_end * 1000)
                : null),
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
          // Check if this is a trial subscription
          const isTrialSubscription = subscription.status === 'trialing';
          const isCanceled = subscription.status === 'canceled' || 
                            subscription.cancel_at_period_end;
          const trialEnd = subscription.trial_end 
            ? new Date(subscription.trial_end * 1000)
            : null;

          const updatedUser = await prisma.user.update({
            where: {
              stripeCustomerId: subscription.customer as string,
            },
            data: {
              subscriptionStatus: isCanceled ? 'canceled' : 
                (isTrialSubscription ? 'active' : subscription.status),
              subscriptionEndDate: trialEnd || new Date(subscription.current_period_end * 1000),
            },
          });

          console.log('Updated user subscription:', updatedUser);
        } catch (error) {
          console.error('Error processing subscription event:', error);
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Trial ending soon:', subscription);
        // You can implement email notifications here if needed
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        try {
          const isTrialSubscription = subscription.status === 'trialing';
          const trialEnd = subscription.trial_end 
            ? new Date(subscription.trial_end * 1000)
            : null;

          await prisma.user.update({
            where: {
              stripeCustomerId: subscription.customer as string,
            },
            data: {
              subscriptionStatus: isTrialSubscription ? 'active' : subscription.status,
              subscriptionEndDate: trialEnd || new Date(subscription.current_period_end * 1000),
              stripeSubscriptionId: subscription.id,
              trialStartDate: isTrialSubscription ? new Date() : null,
              trialEndDate: trialEnd,
            },
          });
        } catch (error) {
          console.error('Error processing subscription.created:', error);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        try {
          if (invoice.subscription) {
            await prisma.user.update({
              where: {
                stripeCustomerId: invoice.customer as string,
              },
              data: {
                subscriptionStatus: 'active',
                subscriptionEndDate: new Date(invoice.period_end * 1000),
              },
            });
          }
        } catch (error) {
          console.error('Error processing invoice.paid:', error);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        try {
          if (invoice.subscription) {
            await prisma.user.update({
              where: {
                stripeCustomerId: invoice.customer as string,
              },
              data: {
                subscriptionStatus: 'past_due',
              },
            });
            // You might want to send an email to the user here
          }
        } catch (error) {
          console.error('Error processing invoice.payment_failed:', error);
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