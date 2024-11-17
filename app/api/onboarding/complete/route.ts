import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { stepId } = await req.json();

    if (!stepId) {
      return NextResponse.json(
        { error: 'Step ID is required' },
        { status: 400 }
      );
    }

    // First get existing progress
    const existingProgress = await prisma.onboardingProgress.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Create new array of completed steps without duplicates
    const updatedSteps = existingProgress
      ? existingProgress.completedSteps.includes(stepId)
        ? existingProgress.completedSteps
        : [...existingProgress.completedSteps, stepId]
      : [stepId];

    // Update or create onboarding progress
    const progress = await prisma.onboardingProgress.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        completedSteps: {
          set: updatedSteps
        },
      },
      create: {
        userId: session.user.id,
        completedSteps: [stepId],
      },
    });

    return NextResponse.json({ 
      success: true, 
      completedSteps: progress.completedSteps 
    });
  } catch (error) {
    console.error('Failed to update onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    );
  }
}