import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/authentication/login',
    error: '/authentication/error',
  },
  callbacks: {
    authorized({ req, token }) {
      // Allow access to auth-related paths without authentication
      if (req.nextUrl.pathname.startsWith('/authentication/')) {
        return true;
      }
      // Return true if the token exists
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/api/sources/:path*',
    // Exclude auth-related paths from middleware
    '/((?!authentication|api/auth).*)',
  ]
}