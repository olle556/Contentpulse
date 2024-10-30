import NextAuth, { DefaultSession, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isSubscribed?: boolean;
      subscriptionStatus?: string | null;
      subscriptionPeriodEnd?: Date | null;
    } & DefaultSession["user"]
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name,
              image: user.image,
            },
            create: {
              email: user.email,
              name: user.name!,
              image: user.image,

            },
          });

          user.id = existingUser.id;
          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.id = token.sub!;
        // Fetch the latest user data from the database
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
          }
        });
        
        if (dbUser) {
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    error: '/auth/error',
  },
});

export { handler as GET, handler as POST };