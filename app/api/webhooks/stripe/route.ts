import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

type CustomSubscriptionStatus = Stripe.Subscription.Status | 'trialing_with_payment' | 'trial_canceled' | 'trial_canceled_with_payment';

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


    switch (event.type) {
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
       

        // Validate customer data
        if (!customer.email) {
          console.error('Missing customer email');
          break;
        }

        // Validate customer metadata if you're expecting specific fields
        if (!customer.metadata?.userId) {
          console.error('Missing required userId in customer metadata');
          break;
        }

        try {
          const updatedUser = await prisma.user.update({
            where: {
              email: customer.email,
            },
            data: {
              stripeCustomerId: customer.id,
            },
          });
         
        } catch (error) {
          console.error('Error processing customer.created:', error);
        }
        break;
      }


      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;

        // Set initial trial period if applicable
        const trialEnd = subscription.trial_end ?
          new Date(subscription.trial_end * 1000) : null;
        const trialStart = subscription.trial_start ?
          new Date(subscription.trial_start * 1000) : null;

        try {
          await prisma.user.update({
            where: { stripeCustomerId: subscription.customer as string },
            data: {
              subscriptionStatus: subscription.status,
              subscriptionStartDate: new Date(subscription.current_period_start * 1000),
              subscriptionEndDate: new Date(subscription.current_period_end * 1000),
              stripeSubscriptionId: subscription.id,
              trialStartDate: trialStart,
              trialEndDate: trialEnd
            }
          });
        } catch (error) {
          console.error('Failed to update user subscription:', error);
          throw error;
        }
        break;
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;

        // Check if user is in trial period
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: paymentMethod.customer as string }
        });

        try {
          if (user?.subscriptionStatus === 'trialing') {
            // User has added payment during trial - subscription will continue after trial
            await prisma.user.update({
              where: { stripeCustomerId: paymentMethod.customer as string },
              data: { subscriptionStatus: 'trialing_with_payment' }
            });
          } else if (user?.subscriptionStatus === 'trial_canceled') {
            // User has added payment after canceling trial
            await prisma.user.update({
              where: { stripeCustomerId: paymentMethod.customer as string },
              data: { subscriptionStatus: 'trial_canceled_with_payment' }
            });
          }
        } catch (error) {
          console.error('Failed to update user subscription:', error);
          throw error;
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) break;

        try {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

          // If it's a trial period, don't update the status
          if (subscription.status === 'trialing') {
            break;
          }

          await prisma.user.update({
            where: { stripeCustomerId: invoice.customer as string },
            data: {
              subscriptionStatus: 'active',
              subscriptionEndDate: new Date(subscription.current_period_end * 1000),
              trialStartDate: null,
              trialEndDate: null
            }
          });
        } catch (error) {
          console.error('Failed to update user subscription:', error);
          throw error;
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        let DBsubscriptionStatus: CustomSubscriptionStatus = subscription.status;

        // Check for attached payment methods
        try {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: subscription.customer as string,
          });
          // First check trial status with payment
          if (subscription.status === 'trialing' && paymentMethods.data.length > 0) {
            if (subscription.cancel_at_period_end) {
              DBsubscriptionStatus = 'trial_canceled_with_payment';
            } else {
              DBsubscriptionStatus = 'trialing_with_payment';
            }
          }
          // Then handle regular trial cancellation
          else if (subscription.status === 'trialing' && subscription.cancel_at_period_end) {
            DBsubscriptionStatus = 'trial_canceled';
          }
          // Finally handle regular cancellation
          else if (subscription.cancel_at_period_end) {
            DBsubscriptionStatus = 'canceled';
          }
        } catch (error) {
          console.error('Error checking payment methods:', error);
        }

        try {
          await prisma.user.update({
            where: { stripeCustomerId: subscription.customer as string },
            data: {
              subscriptionStatus: DBsubscriptionStatus,
              subscriptionEndDate: new Date(subscription.current_period_end * 1000),
              trialEndDate: subscription.trial_end ?
                new Date(subscription.trial_end * 1000) : null
            }
          });
        } catch (error) {
          console.error('Failed to update user subscription:', error);
          throw error;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        try {
          await prisma.user.update({
            where: { stripeCustomerId: subscription.customer as string },
            data: {
              subscriptionStatus: 'inactive',
              subscriptionEndDate: null,
              stripeSubscriptionId: null,
              trialStartDate: null,
              trialEndDate: null
            }
          });
        } catch (error) {
          console.error('Failed to update user subscription:', error);
          throw error;
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
            break;
          }
        } catch (error) {
          console.error('Error processing invoice.payment_failed:', error);
        }
      };


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