import { prisma } from '@/lib/prisma';

export async function checkSubscriptionAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionEndDate: true,
      trialEndDate: true,
      isTrialPaused: true,
    },
  });

  if (!user) return false;

  const now = new Date();

  // Block access if trial is paused
  if (user.isTrialPaused) {
    return false;
  }

  // Check for expired subscription
  if (user.subscriptionStatus === 'canceled' && 
      user.subscriptionEndDate && 
      now >= new Date(user.subscriptionEndDate)) {
    return false;
  }

  return (
    user.subscriptionStatus === 'active' ||
    user.subscriptionStatus === 'trialing' ||
    (user.subscriptionStatus === 'canceled' && 
     user.subscriptionEndDate && 
     now < new Date(user.subscriptionEndDate))
  );
}