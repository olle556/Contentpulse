import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import { checkSubscription } from '@/lib/subscription';

const protectedGenerationPaths = [
  '/api/generate-post',
  '/api/schedule',
];

// Middleware wrapped with withAuth to maintain authentication for all routes
export default withAuth(
  async function middleware(request) {

              // Check for protected generation paths
              //if (protectedGenerationPaths.some(path => request.url.includes(path))) {
              //  const token = request.nextauth.token;

              //  if (!token?.sub) {
              //    return new NextResponse('Unauthorized', { status: 401 });
              //  }

                //const hasSubscription = await checkSubscription(token.sub); -> använder checksubscription i shceck-subscription_2 routen istället

                // Make API call to check subscription with proper error handling

    // Only check subscription for API generation paths
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
          throw new Error('Failed to check subscription');
        }
        const data = await response.json();
        console.log('Full middleware check response:', {
          data,
          responseOk: response.ok,
          status: response.status
        });

        if (!data.authorized) {
          return NextResponse.json({ 
            error: 'Subscription required',
            redirectUrl: '/dashboard/settings'
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
      authorized: ({ token }) => !!token
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