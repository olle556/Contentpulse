import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkSubscription } from '@/lib/subscription';

const allowedOrigins = [
  'https://www.contentpulse.app',
  'https://contentpulse.app',
  'http://localhost:3000'
];

function handleCORS(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin');
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  }
  
  return response;
}

const protectedGenerationPaths = [
  '/api/generate-post',
  '/api/schedule',
];

export default withAuth(
  async function middleware(request: NextRequest) {
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      return handleCORS(request, response);
    }

    const authHeader = request.headers.get('authorization');
    const isCronRequest = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (isCronRequest && request.nextUrl.pathname.startsWith('/api/generate-post')) {
      console.log('Valid CRON request detected for generate-post, bypassing checks');
      const response = NextResponse.next();
      return handleCORS(request, response);
    }

    if (protectedGenerationPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/check-subscription_2`, {
          cache: 'no-store',
          credentials: 'include',
          headers: {
            cookie: request.headers.get('cookie') || '',
          }
        });
        
        if (!response.ok) {
          console.error('Subscription check failed:', await response.text());
          const errorResponse = NextResponse.json(
            { error: 'Failed to check subscription' }, 
            { status: 500 }
          );
          return handleCORS(request, errorResponse);
        }
        
        const data = await response.json();
        console.log('Full middleware check response:', {
          data,
          responseOk: response.ok,
          status: response.status
        });

        if (!data.authorized) {
          const errorResponse = NextResponse.json({ 
            error: 'Subscription required',
            type: data.status === 'trial_ended' ? 'TRIAL_ENDED' : 'NO_SUBSCRIPTION',
            action: 'COMPLETE_SUBSCRIPTION',
            portalUrl: '/api/stripe/create-portal'
          }, { 
            status: 403 
          });
          return handleCORS(request, errorResponse);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        const errorResponse = NextResponse.json(
          { error: 'Internal Server Error' }, 
          { status: 500 }
        );
        return handleCORS(request, errorResponse);
      }
    }

    const response = NextResponse.next();
    return handleCORS(request, response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const authHeader = req.headers.get('authorization');
        const isCronRequest = authHeader === `Bearer ${process.env.CRON_SECRET}`;
        return !!token || isCronRequest;
      }
    },
    pages: {
      signIn: '/authentication/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/generate-post/:path*',
    '/api/schedule/:path*',
    '/api/check-subscription_2/:path*',
    '/api/stripe/:path*',
  ]
};