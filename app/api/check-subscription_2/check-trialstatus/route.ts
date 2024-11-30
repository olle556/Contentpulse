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
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Calculate if user is within 7-day trial period
    const trialEndDate = new Date(user.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const isInTrialPeriod = new Date() < trialEndDate && user.subscriptionStatus !== 'active';

    return NextResponse.json({
      status: isInTrialPeriod ? 'trial' : user.subscriptionStatus,
      trialEndDate: isInTrialPeriod ? trialEndDate : null,
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}