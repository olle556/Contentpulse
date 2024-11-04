import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { Adapter, AdapterUser, AdapterAccount, AdapterSession } from "next-auth/adapters";

interface CreateUserData {
  email: string;
  emailVerified?: Date | null;
  name?: string | null;
  image?: string | null;
}

// Create a function to get a new PrismaClient instance
const getPrismaClient = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL,
      },
    },
  });
};

// Create a wrapper for Prisma operations
const prismaOperation = async <T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> => {
  const prisma = getPrismaClient();
  try {
    const result = await operation(prisma);
    return result;
  } finally {
    await prisma.$disconnect();
  }
};

const customPrismaAdapter: Adapter = {
  async createUser(data: CreateUserData): Promise<AdapterUser> {
    return prismaOperation(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: data.emailVerified,
        },
      });
      return {
        id: user.id,
        email: user.email || "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    });
  },

  async getUser(id: string): Promise<AdapterUser | null> {
    return prismaOperation(async (prisma) => {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email || "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    });
  },

  async getUserByEmail(email: string): Promise<AdapterUser | null> {
    return prismaOperation(async (prisma) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email || "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    });
  },

  async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string, provider: string }): Promise<AdapterUser | null> {
    return prismaOperation(async (prisma) => {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            providerAccountId: providerAccountId,
            provider: provider,
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
    });
  },

  async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">): Promise<AdapterUser> {
    return prismaOperation(async (prisma) => {
      const data: Record<string, any> = {};
      
      if (user.name !== undefined) data.name = user.name;
      if (user.email !== undefined) data.email = user.email;
      if (user.image !== undefined) data.image = user.image;
      if (user.emailVerified !== undefined) data.emailVerified = user.emailVerified;

      const updated = await prisma.user.update({
        where: { id: user.id },
        data
      });

      return {
        id: updated.id,
        email: updated.email || "",
        emailVerified: updated.emailVerified,
        name: updated.name,
        image: updated.image,
      };
    });
  },

  async linkAccount(data: AdapterAccount): Promise<void> {
    return prismaOperation(async (prisma) => {
      await prisma.account.create({ data });
    });
  },

  async createSession(data: AdapterSession): Promise<AdapterSession> {
    return prismaOperation(async (prisma) => {
      return prisma.session.create({ data });
    });
  },

  async getSessionAndUser(sessionToken: string): Promise<{ user: AdapterUser, session: AdapterSession } | null> {
    return prismaOperation(async (prisma) => {
      const userAndSession = await prisma.session.findUnique({
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
    });
  },

  async updateSession(
    session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
  ): Promise<AdapterSession | null> {
    return prismaOperation(async (prisma) => {
      const data: Record<string, any> = {};
      
      if (session.expires !== undefined) data.expires = session.expires;
      if (session.userId !== undefined) data.userId = session.userId;

      const updated = await prisma.session.update({
        where: { sessionToken: session.sessionToken },
        data
      });

      return updated;
    });
  },

  async deleteSession(sessionToken: string): Promise<void> {
    return prismaOperation(async (prisma) => {
      await prisma.session.delete({ where: { sessionToken } });
    });
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
    async jwt({ token, user }) {
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