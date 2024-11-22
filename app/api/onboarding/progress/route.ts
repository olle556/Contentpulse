import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        onboardingProgress: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Use the stored progress instead of counting records
    const completedSteps = user.onboardingProgress?.completedSteps || [];

    // Keep counts for debugging purposes only
    const [brandCount, sourceCount, postCount, scheduleCount] = await Promise.all([
      prisma.brand.count({
        where: { userId: user.id }
      }),
      prisma.contentSource.count({
        where: { userId: user.id }
      }),
      prisma.generatedPost.count({
        where: { userId: user.id }
      }),
      prisma.contentSchedule.count({
        where: { userId: user.id }
      })
    ]);

    return NextResponse.json({
      success: true,
      completedSteps,
      debug: {
        brandCount,
        sourceCount,
        postCount,
        scheduleCount,
        storedProgress: completedSteps
      }
    });

  } catch (error) {
    console.error('Error in progress endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}