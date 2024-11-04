import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { Adapter, AdapterUser } from "next-auth/adapters";

interface CreateUserData {
  email: string;
  emailVerified?: Date | null;
  name?: string | null;
  image?: string | null;
}

// Create a custom adapter with connection handling
const customPrismaAdapter: Adapter = {
  ...PrismaAdapter(prisma),
  async createUser(data: CreateUserData): Promise<AdapterUser> {
    try {
      const user = await prisma.user.create({ 
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: data.emailVerified,
        } 
      });
      await prisma.$disconnect();
      return {
        id: user.id,
        email: user.email || "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      await prisma.$disconnect();
      throw error;
    }
  },
  async getUser(id): Promise<AdapterUser | null> {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      await prisma.$disconnect();
      if (!user) return null;
      return {
        id: user.id,
        email: user.email || "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      await prisma.$disconnect();
      throw error;
    }
  },
  async getUserByEmail(email): Promise<AdapterUser | null> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      await prisma.$disconnect();
      if (!user) return null;
      return {
        id: user.id,
        email: user.email || "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      await prisma.$disconnect();
      throw error;
    }
  },
  async getUserByAccount({ providerAccountId, provider }): Promise<AdapterUser | null> {
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
      if (!account?.user) return null;
      return {
        id: account.user.id,
        email: account.user.email || "",
        emailVerified: account.user.emailVerified,
        name: account.user.name,
        image: account.user.image,
      };
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