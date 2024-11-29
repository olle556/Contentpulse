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
  
    console.log('User subscription data:', user);
  
    if (!user) return false;
  
    const isValid = user.subscriptionStatus === 'active' && 
      (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > new Date());
    
    console.log('Subscription valid:', isValid);
    return isValid;
};