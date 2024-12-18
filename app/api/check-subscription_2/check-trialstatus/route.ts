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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const trialEndDate = user.trialEndDate;
    const isInTrial = trialEndDate ? now < trialEndDate : false;

    return NextResponse.json({
      status: isInTrial ? "trial" : "inactive",
      trialEndDate: user.trialEndDate,
      hasSubscriptionHistory: !!(user.stripeSubscriptionId || user.stripeCustomerId),
    });

  } catch (error) {
    console.error("Error checking trial status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}