// Create new file: app/api/check-auth/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Full session details:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('Session user ID missing. Session user:', session?.user);
      return NextResponse.json({ authorized: false, reason: 'no_user_id' });
    }
    
    // Get full user details including trial and subscription info
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        trialStartDate: true,
        trialEndDate: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authorized: false, reason: 'user_not_found' });
    }

    const now = new Date();
    const trialEndDate = user.trialEndDate;
    const subscriptionEndDate = user.subscriptionEndDate;

    // Calculate remaining trial days
    const remainingDays = trialEndDate 
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    let status;
    let authorized = false;
    let message = '';
    let needsPaymentMethod = false;

    if (user.subscriptionStatus === 'trialing') {
      status = 'trial';
      authorized = true;
      message = `Trial period: ${remainingDays} days remaining`;
      needsPaymentMethod = !user.stripeCustomerId; // True if no payment method added
    } else if (user.subscriptionStatus === 'active') {
      status = 'active';
      authorized = true;
      message = `Subscription active until ${subscriptionEndDate?.toISOString()}`;
    } else if (user.subscriptionStatus === 'canceled' && subscriptionEndDate && now < subscriptionEndDate) {
      status = 'grace_period';
      authorized = true;
      message = `Access until ${subscriptionEndDate.toISOString()}`;
    } else if (user.subscriptionStatus === 'paused' && remainingDays > 0) {
      status = 'trial_paused';
      authorized = false;
      message = `Trial paused. ${remainingDays} days remaining if reactivated`;
    } else {
      status = trialEndDate ? 'trial_ended' : 'inactive';
      authorized = false;
      message = trialEndDate ? 'Trial period has ended' : 'No active subscription';
    }
    
    return NextResponse.json({ 
      authorized,
      status,
      message,
      needsPaymentMethod,
      trialEndDate: user.trialEndDate,
      subscriptionEndDate: user.subscriptionEndDate,
      remainingDays,
      debug: { 
        userId: session.user.id,
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