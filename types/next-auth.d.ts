import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isSubscribed?: boolean;
      subscriptionStatus?: string | null;
      subscriptionPeriodEnd?: Date | null;
      accountType: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    isSubscribed?: boolean;
    subscriptionStatus?: string | null;
    subscriptionPeriodEnd?: Date | null;
    accountType: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}