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

          // Always set new subscriptions to trialing for 7 days
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 7);

          // Update user record
          const updatedUser = await prisma.user.update({
            where: {
              stripeCustomerId: customerId,
            },
            data: {
              subscriptionStatus: 'trialing',
              trialStartDate: new Date(),
              trialEndDate: trialEnd,
              subscriptionEndDate: subscription 
                ? new Date(subscription.current_period_end * 1000)
                : null,
              stripeSubscriptionId: subscription?.id || null,
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
        
        try {
          let subscriptionStatus;

          // Handle paid subscription cancellation
          if (subscription.cancel_at_period_end) {
            subscriptionStatus = 'canceled';
            console.log('Paid subscription scheduled for cancellation at period end:', 
              new Date(subscription.current_period_end * 1000));
          }
          // Handle immediate cancellation
          else if (subscription.status === 'canceled') {
            subscriptionStatus = 'canceled';
          }
          // Handle other status updates
          else if (subscription.status === 'trialing') {
            subscriptionStatus = 'trialing';
          } else if (subscription.status === 'active') {
            subscriptionStatus = 'active';
          } else {
            subscriptionStatus = subscription.status;
          }

          await prisma.user.update({
            where: {
              stripeCustomerId: subscription.customer as string,
            },
            data: {
              subscriptionStatus,
              subscriptionStartDate: new Date(subscription.current_period_start * 1000),
              subscriptionEndDate: new Date(subscription.current_period_end * 1000),
              stripeSubscriptionId: subscription.id,
              trialStartDate: subscription.trial_start 
                ? new Date(subscription.trial_start * 1000)
                : null,
              trialEndDate: subscription.trial_end 
                ? new Date(subscription.trial_end * 1000)
                : null,
            },
          });
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
        console.log('DEBUG - New subscription:', {
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        });
        
        try {
          await prisma.user.update({
            where: {
              stripeCustomerId: subscription.customer as string,
            },
            data: {
              subscriptionStatus: subscription.status,
              subscriptionEndDate: new Date(subscription.current_period_end * 1000),
              stripeSubscriptionId: subscription.id,
              subscriptionStartDate: new Date(subscription.current_period_start * 1000),
              // Only set trial dates if actually in trial
              trialStartDate: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
              trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            },
          });
        } catch (error) {
          console.error('Subscription creation error:', error);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        try {
          if (invoice.subscription) {
            // Get the subscription to check if it was a trial
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            
            // Only update to 'active' if this is the first payment after trial
            // or if it's a regular payment
            await prisma.user.update({
              where: {
                stripeCustomerId: invoice.customer as string,
              },
              data: {
                // If coming from trial, update to active
                subscriptionStatus: subscription.status === 'trialing' ? 'active' : 'active',
                subscriptionEndDate: new Date(invoice.period_end * 1000),
                // Clear trial dates if transitioning from trial
                ...(subscription.status === 'trialing' ? {
                  trialStartDate: null,
                  trialEndDate: null,
                } : {}),
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