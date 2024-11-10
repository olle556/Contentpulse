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
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Get counts instead of full records
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

    const completedSteps = [];

    if (brandCount > 0) completedSteps.push('brand');
    if (sourceCount > 0) completedSteps.push('sources');
    if (postCount > 0) completedSteps.push('posts');
    if (scheduleCount > 0) completedSteps.push('schedule');

    return NextResponse.json({
      success: true,
      completedSteps,
      debug: {
        brandCount,
        sourceCount,
        postCount,
        scheduleCount
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