import { prisma } from '@/lib/prisma';

export async function checkSubscriptionAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionEndDate: true,
      trialEndDate: true,
    },
  });

  if (!user) return false;

  const now = new Date();

  // Check for expired subscription
  if (user.subscriptionStatus === 'canceled' && 
      user.subscriptionEndDate && 
      now >= new Date(user.subscriptionEndDate)) {
    return false; // Subscription has expired
  }

  // Allow access if:
  // 1. Active subscription
  // 2. In trial period
  // 3. Canceled but still in grace period (before end date)
  return (
    user.subscriptionStatus === 'active' ||
    user.subscriptionStatus === 'trialing' ||
    (user.subscriptionStatus === 'canceled' && 
     user.subscriptionEndDate && 
     now < new Date(user.subscriptionEndDate))
  );
}