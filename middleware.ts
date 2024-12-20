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

        // Call the subscription check API
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/check-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: token.sub }),
        });

        const data = await response.json();
        
        if (!data.hasAccess) {
          return NextResponse.json({ 
            error: 'Subscription required',
            type: data.reason === 'trial_paused' ? 'TRIAL_PAUSED' : 'SUBSCRIPTION_REQUIRED',
            action: data.reason === 'trial_paused' ? 'REACTIVATE_TRIAL' : 'COMPLETE_SUBSCRIPTION',
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