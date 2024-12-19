import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import { checkSubscriptionAccess } from '@/lib/subscription';

const protectedGenerationPaths = [
  '/api/generate-post',
  '/api/schedule',
];

// Middleware wrapped with withAuth to maintain authentication for all routes
export default withAuth(
  async function middleware(request) {
    // Improved CRON request detection
    const authHeader = request.headers.get('authorization');
    const isCronRequest = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    // If it's a CRON request with valid secret, allow it through immediately
    if (isCronRequest && request.nextUrl.pathname.startsWith('/api/generate-post')) {
      console.log('Valid CRON request detected for generate-post, bypassing checks');
      return NextResponse.next();
    }

    // Only check subscription for protected paths
    if (protectedGenerationPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      try {
        const token = request.nextauth.token;
        
        if (!token?.sub) {
          return new NextResponse('Unauthorized', { status: 401 });
        }

        // Use the updated subscription check
        const hasAccess = await checkSubscriptionAccess(token.sub);
        
        if (!hasAccess) {
          return NextResponse.json({ 
            error: 'Subscription required',
            type: 'SUBSCRIPTION_REQUIRED',
            action: 'COMPLETE_SUBSCRIPTION',
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
    // Keep existing authentication protection for all dashboard routes
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

// Keep protecting all dashboard routes with authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/generate-post/:path*',
    '/api/schedule/:path*',
  ]
};