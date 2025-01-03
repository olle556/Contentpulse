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

    const userCheck = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!userCheck?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        onboardingProgress: true,
        brands: true,
        sources: true,
        posts: true,
        contentSchedules: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Calculate actual completed steps based on data existence
    const actualCompletedSteps = [];
    
    if (user.brands.length > 0) actualCompletedSteps.push('brand');
    if (user.sources.length > 0) actualCompletedSteps.push('sources');
    if (user.posts.length > 0) actualCompletedSteps.push('posts');
    if (user.contentSchedules.length > 0) actualCompletedSteps.push('schedule');

    // Update stored progress if it differs from actual progress
    const storedSteps = user.onboardingProgress?.completedSteps || [];
    if (JSON.stringify(actualCompletedSteps.sort()) !== JSON.stringify(storedSteps.sort())) {
      await prisma.onboardingProgress.upsert({
        where: {
          userId: user.id
        },
        create: {
          userId: user.id,
          completedSteps: actualCompletedSteps
        },
        update: {
          completedSteps: actualCompletedSteps
        }
      });
    }

    return NextResponse.json({
      success: true,
      completedSteps: actualCompletedSteps,
      debug: {
        brandCount: user.brands.length,
        sourceCount: user.sources.length,
        postCount: user.posts.length,
        scheduleCount: user.contentSchedules.length,
        storedProgress: storedSteps
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