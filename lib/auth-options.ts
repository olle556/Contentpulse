import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("Sign in attempt:", { 
          email: user.email, 
          provider: account?.provider 
        });

        if (account?.provider === "google" && user.email) {
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
          
          console.log("User upserted successfully:", existingUser.id);
          user.id = existingUser.id;
          return true;
        }
        return true;
      } catch (error) {
        console.error("Detailed sign in error:", error);
        // Return false to show there was an error
        return false;
      }
    },
    async session({ session, token }) {
      try {
        if (session?.user) {
          session.user.id = token.sub!;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          token.sub = user.id;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
  },
  pages: {
    signIn: "/authentication/login",
    error: "/authentication/error",
  },
  debug: true,
};