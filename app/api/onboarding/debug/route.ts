import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      onboardingProgress,
      brandCount,
      sourceCount,
      postCount,
      scheduleCount
    ] = await Promise.all([
      prisma.onboardingProgress.findUnique({
        where: { userId: session.user.id }
      }),
      prisma.brand.count({ where: { userId: session.user.id } }),
      prisma.contentSource.count({ where: { userId: session.user.id } }),
      prisma.generatedPost.count({ where: { userId: session.user.id } }),
      prisma.contentSchedule.count({ where: { userId: session.user.id } })
    ]);

    return NextResponse.json({
      success: true,
      debug: {
        storedProgress: onboardingProgress?.completedSteps || [],
        counts: {
          brand: brandCount,
          sources: sourceCount,
          posts: postCount,
          schedule: scheduleCount
        }
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    );
  }
}