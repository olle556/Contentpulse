import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  
  // Return response with CORS headers
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || '',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const origin = request.headers.get('origin');
    
    if (!session?.user?.email) {
      const response = new NextResponse('Unauthorized', { status: 401 });
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      return response;
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
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      return response;
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

    // Add CORS headers to successful response
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;

  } catch (error) {
    console.error('Error checking subscription status:', error);
    const response = new NextResponse('Internal server error', { status: 500 });
    
    const origin = request.headers.get('origin');
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return response;
  }
}