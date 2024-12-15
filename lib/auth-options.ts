import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { Adapter, AdapterUser, AdapterAccount, AdapterSession } from "next-auth/adapters";
import { prisma } from "./prisma";

interface CreateUserData {
  email: string;
  emailVerified?: Date | null;
  name?: string | null;
  image?: string | null;
}

interface CreateSessionData {
  sessionToken: string;
  userId: string;
  expires: Date;
}

const customPrismaAdapter: Adapter = {
  async createUser(data: CreateUserData): Promise<AdapterUser> {
    const prismaClient = new PrismaClient();
    try {
      const user = await prismaClient.user.create({ 
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: data.emailVerified,
        } 
      });
      return {
        id: user.id,
        email: user.email || "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    } finally {
      await prismaClient.$disconnect();
    }
  },
  async getUser(id): Promise<AdapterUser | null> {
    const prismaClient = new PrismaClient();
    try {
      const user = await prismaClient.user.findUnique({ where: { id } });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email || "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    } finally {
      await prismaClient.$disconnect();
    }
  },
  async getUserByEmail(email): Promise<AdapterUser | null> {
    const prismaClient = new PrismaClient();
    try {
      const user = await prismaClient.user.findUnique({ where: { email } });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email || "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    } finally {
      await prismaClient.$disconnect();
    }
  },
  async getUserByAccount({ providerAccountId, provider }): Promise<AdapterUser | null> {
    const prismaClient = new PrismaClient();
    try {
      const account = await prismaClient.account.findUnique({
        where: {
          provider_providerAccountId: {
            providerAccountId,
            provider,
          },
        },
        include: { user: true },
      });
      if (!account?.user) return null;
      return {
        id: account.user.id,
        email: account.user.email || "",
        emailVerified: account.user.emailVerified,
        name: account.user.name,
        image: account.user.image,
      };
    } finally {
      await prismaClient.$disconnect();
    }
  },
  async updateUser(user) {
    const prismaClient = new PrismaClient();
    try {
      const updated = await prismaClient.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
        },
      });
      return {
        id: updated.id,
        email: updated.email || "",
        emailVerified: updated.emailVerified,
        name: updated.name,
        image: updated.image,
      };
    } finally {
      await prismaClient.$disconnect();
    }
  },
  async linkAccount(data: AdapterAccount) {
    const prismaClient = new PrismaClient();
    try {
      await prismaClient.account.create({ data });
    } finally {
      await prismaClient.$disconnect();
    }
  },
  async createSession(data: CreateSessionData): Promise<AdapterSession> {
    const prismaClient = new PrismaClient();
    try {
      return await prismaClient.session.create({ data });
    } finally {
      await prismaClient.$disconnect();
    }
  },
  async getSessionAndUser(sessionToken) {
    const prismaClient = new PrismaClient();
    try {
      const userAndSession = await prismaClient.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return {
        user: {
          id: user.id,
          email: user.email || "",
          emailVerified: user.emailVerified,
          name: user.name,
          image: user.image,
        },
        session,
      };
    } finally {
      await prismaClient.$disconnect();
    }
  },
  async updateSession(data) {
    const prismaClient = new PrismaClient();
    try {
      return await prismaClient.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
    } finally {
      await prismaClient.$disconnect();
    }
  },
  async deleteSession(sessionToken) {
    const prismaClient = new PrismaClient();
    try {
      await prismaClient.session.delete({ where: { sessionToken } });
    } finally {
      await prismaClient.$disconnect();
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
    },
    signIn: async ({ user }) => {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { stripeCustomerId: true }
        });

        // Store this information in the user's session instead of redirecting
        if (!existingUser?.stripeCustomerId) {
          return true; // Allow sign in, we'll handle redirect in the dashboard
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/authentication/login",
    error: "/authentication/error",
  },
  debug: false,
};