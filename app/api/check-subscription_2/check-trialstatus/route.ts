import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscriptionStatus: true,
        createdAt: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check if within trial period (7 days) and end date is in the future
    const isInTrialPeriod = user.subscriptionEndDate && 
      new Date(user.subscriptionEndDate) > new Date() && // Trial hasn't expired
      ((new Date(user.subscriptionEndDate).getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) <= 7 &&
      user.subscriptionStatus !== 'canceled'; // Not canceled

    // Consider a user in trial if they have a future end date within 7 days of creation
    // OR if they have an active status (from Stripe) with a trial end date
    const effectiveTrialStatus = isInTrialPeriod && user.subscriptionStatus !== 'canceled';

    console.log('User data:', {
      subscriptionStatus: user.subscriptionStatus,
      createdAt: user.createdAt,
      subscriptionEndDate: user.subscriptionEndDate,
      isInTrialPeriod,
      effectiveTrialStatus
    });

    return NextResponse.json({
      status: effectiveTrialStatus ? 'trial' : user.subscriptionStatus,
      trialEndDate: effectiveTrialStatus ? user.subscriptionEndDate : null,
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}