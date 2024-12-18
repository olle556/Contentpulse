import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        trialEndDate: true
      }
    });

    if (!user?.stripeCustomerId || !user?.stripeSubscriptionId) {
      return new NextResponse(
        JSON.stringify({ error: 'No active subscription found', redirectTo: '/#pricing' }), 
        { status: 403 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create portal session' }), 
      { status: 500 }
    );
  }
}