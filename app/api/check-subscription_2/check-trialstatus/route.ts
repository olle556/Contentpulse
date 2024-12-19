import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        trialStartDate: true,
        trialEndDate: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const trialEndDate = user.trialEndDate;
    const subscriptionEndDate = user.subscriptionEndDate;

    // Calculate remaining trial days if in trial
    const remainingDays = trialEndDate 
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    // Handle different subscription states
    let status;
    let authorized = false;

    if (user.subscriptionStatus === 'active') {
      // Active paid subscription
      status = 'active';
      authorized = true;
    } else if (user.subscriptionStatus === 'canceled' && subscriptionEndDate && now < subscriptionEndDate) {
      // Cancelled paid subscription still in grace period
      status = 'grace_period';
      authorized = true;
    } else if (user.subscriptionStatus === 'trialing') {
      // Active trial
      status = 'trial';
      authorized = true;
    } else if (user.subscriptionStatus === 'paused' && remainingDays > 0) {
      // Paused trial that can still be reactivated
      status = 'trial_paused';
      authorized = false;
    } else {
      // Trial ended or subscription fully expired
      status = trialEndDate ? 'trial_ended' : 'inactive';
      authorized = false;
    }

    return NextResponse.json({
      authorized,
      status,
      trialEndDate: user.trialEndDate,
      subscriptionEndDate: user.subscriptionEndDate,
      remainingDays,
      hasSubscriptionHistory: !!(user.stripeSubscriptionId || user.stripeCustomerId),
    });

  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}