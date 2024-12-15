import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
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

export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      const response = new NextResponse('Unauthorized', { status: 401 });
      return addCorsHeaders(response, origin);
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
      const response = new NextResponse('User not found', { status: 404 });
      return addCorsHeaders(response, origin);
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

    // Create response with data
    const response = NextResponse.json({
      status: effectiveTrialStatus ? 'trial' : user.subscriptionStatus,
      trialEndDate: effectiveTrialStatus ? user.subscriptionEndDate : null,
    });

    return addCorsHeaders(response, origin);

  } catch (error) {
    console.error('Error checking subscription status:', error);
    const response = new NextResponse('Internal server error', { status: 500 });
    return addCorsHeaders(response, origin);
  }
}