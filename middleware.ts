import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import { checkSubscription } from '@/lib/subscription';

const protectedGenerationPaths = [
  '/api/generate',
  '/api/schedule'
];

export default withAuth(
  async function middleware(request) {
    // Check for protected generation paths
    if (protectedGenerationPaths.some(path => request.url.includes(path))) {
      const token = request.nextauth.token;

      if (!token?.sub) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      //const hasSubscription = await checkSubscription(token.sub); ** använder checksub i routen

      // Make API call to check subscription with proper error handling
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/check-subscription_2`);
        if (!response.ok) {
          console.error('Subscription check failed:', await response.text());
          throw new Error('Failed to check subscription');
        }
        const data = await response.json();
        console.log('Subscription check response:', data);

        if (!data.authorized) {
          return new NextResponse('Subscription required', { status: 403 });
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/authentication/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/api/sources/:path*',
    '/api/generate/:path*',
    '/api/schedule/:path*'
  ]
}