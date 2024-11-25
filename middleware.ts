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

      const hasSubscription = await checkSubscription(token.sub);
      
      if (!hasSubscription) {
        return new NextResponse('Subscription required', { status: 403 });
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