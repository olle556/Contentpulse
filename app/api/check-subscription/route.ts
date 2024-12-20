import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ hasAccess: false, reason: 'no_user_id' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionEndDate: true,
        trialEndDate: true,
        isTrialPaused: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ hasAccess: false, reason: 'user_not_found' });
    }

    const now = new Date();

    // Block access if trial is paused AND they've never had a paid subscription
    if (user.isTrialPaused && !user.stripeSubscriptionId) {
      return NextResponse.json({ hasAccess: false, reason: 'trial_paused' });
    }

    // For paid subscribers who cancelled, check end date
    if (user.subscriptionStatus === 'canceled' && 
        user.subscriptionEndDate && 
        now >= new Date(user.subscriptionEndDate)) {
      return NextResponse.json({ hasAccess: false, reason: 'subscription_expired' });
    }

    const hasAccess = 
      user.subscriptionStatus === 'active' ||
      user.subscriptionStatus === 'trialing' ||
      (user.subscriptionStatus === 'canceled' && 
       user.subscriptionEndDate && 
       now < new Date(user.subscriptionEndDate));

    return NextResponse.json({ hasAccess, subscriptionStatus: user.subscriptionStatus });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json({ hasAccess: false, reason: 'error' });
  }
}