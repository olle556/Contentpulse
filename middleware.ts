import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/authentication/login',
  },
  callbacks: {
    authorized({ req, token }) {
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
  ]
}