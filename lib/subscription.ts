import { prisma } from '@/lib/prisma';

export async function checkSubscriptionAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionEndDate: true,
      trialEndDate: true,
      isTrialPaused: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) return false;

  const now = new Date();

  // Block access if trial is paused AND they've never had a paid subscription
  if (user.isTrialPaused && !user.stripeSubscriptionId) {
    return false;
  }

  // For paid subscribers who cancelled, check end date
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