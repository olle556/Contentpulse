import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { DefaultSession } from "next-auth";
import { prisma } from "./prisma";
import { User } from "@prisma/client";

interface SessionUser {
  id: string;
  accountType: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      const prismaUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          accountType: prismaUser?.accountType || 'individual',
        } as SessionUser,
      };
    },
  },
};