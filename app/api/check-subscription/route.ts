import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        stripeCustomerId: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    console.log('User subscription status:', user);

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}