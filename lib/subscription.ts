import { prisma } from './prisma';

export const checkSubscription = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });
  
    if (!user) return false;
  
    return user.subscriptionStatus === 'active' && 
      (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > new Date());
  };