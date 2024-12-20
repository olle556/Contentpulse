import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';

const protectedGenerationPaths = [
  '/api/generate-post',
  '/api/schedule',
];

export default withAuth(
  async function middleware(request) {
    const authHeader = request.headers.get('authorization');
    const isCronRequest = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (isCronRequest && request.nextUrl.pathname.startsWith('/api/generate-post')) {
      return NextResponse.next();
    }

    if (protectedGenerationPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      try {
        const token = request.nextauth.token;
        
        if (!token?.sub) {
          return new NextResponse('Unauthorized', { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/check-subscription`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();
        
        if (!data.authorized) {
          let errorType = 'SUBSCRIPTION_REQUIRED';
          let action = 'COMPLETE_SUBSCRIPTION';

          if (data.status === 'canceled' && (!data.subscriptionEndDate || new Date() > new Date(data.subscriptionEndDate))) {
            errorType = 'SUBSCRIPTION_EXPIRED';
            action = 'RENEW_SUBSCRIPTION';
          } else if (data.status === 'trial' && data.remainingTrialDays <= 0) {
            errorType = 'TRIAL_EXPIRED';
            action = 'COMPLETE_SUBSCRIPTION';
          }

          return NextResponse.json({ 
            error: data.message || 'Subscription required',
            type: errorType,
            action: action,
            redirectTo: '/dashboard/settings'
          }, { 
            status: 403 
          });
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
      }
    }

    return NextResponse.next();
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
  ]
};