// Create new file: app/api/check-auth/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ authorized: false, reason: 'no_user_id' });
    }
    
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        trialStartDate: true,
        trialEndDate: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authorized: false, reason: 'user_not_found' });
    }

    // Check if user has a payment method
    let hasPaymentMethod = false;
    if (user.stripeCustomerId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });
      hasPaymentMethod = paymentMethods.data.length > 0;
    }

    const now = new Date();
    const trialEndDate = user.trialEndDate;
    const subscriptionEndDate = user.subscriptionEndDate;

    // Calculate remaining trial days (if applicable)
    const remainingTrialDays = trialEndDate 
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    let status;
    let authorized = false;
    let message = '';
    let needsPaymentMethod = !hasPaymentMethod;

    // Determine subscription status
    switch (user.subscriptionStatus) {
      case 'trialing':
        if (trialEndDate && now < trialEndDate) {
          status = 'trial';
          authorized = true;
          message = `Trial period: ${remainingTrialDays} days remaining`;
        } else {
          status = 'trial_ended';
          authorized = false;
          message = 'Trial period has ended';
        }
        break;

      case 'active':
        if (subscriptionEndDate && now < subscriptionEndDate) {
          status = 'active';
          authorized = true;
          message = `Subscription active until  ${subscriptionEndDate.toISOString()}`;
        } else {
          status = 'expired';
          authorized = false;
          message = 'Subscription has expired';
        }
        break;

      case 'canceled':
        if (subscriptionEndDate && now < subscriptionEndDate) {
          status = 'grace_period';
          authorized = true;
          message = `Access until ${subscriptionEndDate.toISOString()}`;
        } else {
          status = 'canceled';
          authorized = false;
          message = 'Subscription has been canceled';
        }
        break;

      case 'past_due':
        status = 'past_due';
        authorized = false;
        message = 'Payment is past due';
        break;

      default:
        status = 'inactive';
        authorized = false;
        message = 'No active subscription - subscribe now!';
    }
    
    return NextResponse.json({ 
      authorized,
      status,
      message,
      needsPaymentMethod,
      trialEndDate: user.trialEndDate,
      subscriptionEndDate: user.subscriptionEndDate,
      subscriptionStartDate: user.subscriptionStartDate,
      remainingTrialDays,
      debug: { 
        userId: session.user.id,
        subscriptionStatus: user.subscriptionStatus,
        stripeSubscriptionId: user.stripeSubscriptionId,
        hasPaymentMethod,
        checked: true 
      }
    });
  } catch (error) {
    console.error('Detailed error in check-subscription:', error);
    return NextResponse.json({ 
      authorized: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      reason: 'error_checking'
    });
  }
}