import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.onboardingProgress.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        completedSteps: [],
      },
      create: {
        userId: session.user.id,
        completedSteps: [],
      },
    });

    return NextResponse.json({ 
      success: true, 
      completedSteps: [] 
    });
  } catch (error) {
    console.error('Failed to reset onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to reset onboarding progress' },
      { status: 500 }
    );
  }
}