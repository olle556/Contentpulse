import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

const allowedOrigins = [
  'https://www.contentpulse.app',
  'https://contentpulse.app',
  'http://localhost:3000'
];

function addCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  return response;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, origin);
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.stripeCustomerId) {
      return new NextResponse('No Stripe customer ID', { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });

    const response = NextResponse.json({ url: portalSession.url });
    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error('Error creating portal session:', error);
    const response = NextResponse.json(
      { error: 'Failed to create portal session' }, 
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}