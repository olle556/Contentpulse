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
    
    // First, get the user data
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ authorized: false, reason: 'user_not_found' });
    }



    // Refresh user data after potential update
    const updatedUser = await db.user.findUnique({
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

    // Check payment method
    let hasPaymentMethod = false;
    if (updatedUser?.stripeCustomerId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: updatedUser.stripeCustomerId,
        type: 'card',
      });
      hasPaymentMethod = paymentMethods.data.length > 0;
    }

    const now = new Date();
    const trialEndDate = updatedUser?.trialEndDate;
    const subscriptionEndDate = updatedUser?.subscriptionEndDate;

    // Calculate remaining trial days
    const remainingTrialDays = trialEndDate 
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    let status;
    let authorized = false;
    let message = '';
    let needsPaymentMethod = !hasPaymentMethod;

    // Enhanced status determination
    if (updatedUser?.subscriptionStatus === 'trialing') {
      status = 'trial';
      authorized = true;
      message = `Trial period: ${remainingTrialDays} days remaining`;
    } else if (updatedUser?.subscriptionStatus === 'active') {
      status = 'active';
      authorized = true;
      message = 'Subscription active';
    } else if (updatedUser?.subscriptionStatus === 'canceled' && subscriptionEndDate && now < subscriptionEndDate) {
      status = 'grace_period';
      authorized = true;
      message = `Access until ${subscriptionEndDate.toISOString()}`;
    } else {
      status = updatedUser?.subscriptionStatus || 'inactive';
      authorized = false;
      message = 'No active subscription - subscribe now!';
    }

    return NextResponse.json({
      authorized,
      status,
      message,
      needsPaymentMethod,
      trialEndDate: updatedUser?.trialEndDate,
      subscriptionEndDate: updatedUser?.subscriptionEndDate,
      subscriptionStartDate: updatedUser?.subscriptionStartDate,
      remainingTrialDays,
      debug: {
        userId: session.user.id,
        subscriptionStatus: updatedUser?.subscriptionStatus,
        stripeSubscriptionId: updatedUser?.stripeSubscriptionId,
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