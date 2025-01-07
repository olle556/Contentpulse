import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Define valid steps to prevent invalid data
const VALID_STEPS = ['trial', 'brand', 'sources', 'posts', 'schedule'] as const;
type OnboardingStep = typeof VALID_STEPS[number];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session user:', session?.user);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { stepId } = await req.json();
    console.log('Attempting to complete step:', stepId);

    // Validate stepId
    if (!stepId || !VALID_STEPS.includes(stepId as OnboardingStep)) {
      return NextResponse.json(
        { error: 'Invalid step ID' },
        { status: 400 }
      );
    }

    // Verify the user has the required data for this step
    const hasRequiredData = await verifyStepCompletion(session.user.id, stepId as OnboardingStep);
    
    if (!hasRequiredData) {
      return NextResponse.json(
        { error: 'Cannot mark step as complete - required data is missing' },
        { status: 400 }
      );
    }

    // Get existing progress
    const existingProgress = await prisma.onboardingProgress.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Create new array of completed steps without duplicates
    const updatedSteps = existingProgress
      ? Array.from(new Set([...existingProgress.completedSteps, stepId]))
      : [stepId];

    // Update or create onboarding progress
    const progress = await prisma.onboardingProgress.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        completedSteps: updatedSteps,
      },
      create: {
        userId: session.user.id,
        completedSteps: [stepId],
      },
    });

    console.log('Updated completed steps:', progress.completedSteps);
    return NextResponse.json({ 
      success: true, 
      completedSteps: progress.completedSteps 
    });
  } catch (error) {
    console.error('Complete step error:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    );
  }
}

async function verifyStepCompletion(userId: string, step: OnboardingStep): Promise<boolean> {
  try {
    console.log(`Verifying step ${step} for user ${userId}`);
    
    switch (step) {
      case 'trial': {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { trialEndDate: true }
        });
        console.log('Trial verification - trialEndDate:', user?.trialEndDate);
        const isComplete = !!user?.trialEndDate;
        console.log('Trial verification result:', isComplete);
        return isComplete;
      }
      case 'brand': {
        const brand = await prisma.brand.findFirst({ 
          where: { 
            userId,
            AND: [
              { brandName: { not: '' } },
              { brandVoice: { not: '' } }
            ]
          } 
        });
        console.log('Brand verification result:', brand);
        return !!brand;
      }
      case 'sources': {
        const source = await prisma.contentSource.findFirst({ 
          where: { 
            userId,
            url: { not: '' }
          } 
        });
        console.log('Source check result:', source);
        return !!source;
      }
      case 'posts': {
        const post = await prisma.generatedPost.findFirst({ 
          where: { 
            userId,
            content: { not: '' }
          } 
        });
        console.log('Post check result:', post);
        return !!post;
      }
      case 'schedule': {
        const schedule = await prisma.contentSchedule.findFirst({ 
          where: { 
            userId,
            time: { not: '' },
            platforms: { isEmpty: false }
          } 
        });
        console.log('Schedule check result:', schedule);
        return !!schedule;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error verifying step ${step}:`, error);
    return false;
  }
}