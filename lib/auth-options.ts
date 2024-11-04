import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

// Create a custom adapter with connection handling
const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  async createUser(data: any) {
    try {
      const user = await prisma.user.create({ data });
      await prisma.$disconnect();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      await prisma.$disconnect();
      throw error;
    }
  },
  async getUser(id: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      await prisma.$disconnect();
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      await prisma.$disconnect();
      throw error;
    }
  },
  async getUserByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      await prisma.$disconnect();
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      await prisma.$disconnect();
      throw error;
    }
  },
  async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string, provider: string }) {
    try {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            providerAccountId,
            provider,
          },
        },
        include: { user: true },
      });
      await prisma.$disconnect();
      return account?.user ?? null;
    } catch (error) {
      console.error('Error getting user by account:', error);
      await prisma.$disconnect();
      throw error;
    }
  },
};

export const authOptions: AuthOptions = {
  adapter: customPrismaAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/authentication/login",
    error: "/authentication/error",
  },
  debug: true,
};