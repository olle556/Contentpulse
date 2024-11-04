import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/authentication/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/api/sources/:path*',
  ]
}