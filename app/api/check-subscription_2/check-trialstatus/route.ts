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

    // Calculate if user is in trial by checking if subscriptionEndDate is within 7 days of createdAt
    const isInTrialPeriod = user.subscriptionStatus === 'active' && 
      user.subscriptionEndDate && 
      ((new Date(user.subscriptionEndDate).getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) <= 7;

    return NextResponse.json({
      status: isInTrialPeriod ? 'trial' : user.subscriptionStatus,
      trialEndDate: isInTrialPeriod ? user.subscriptionEndDate : null,
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}