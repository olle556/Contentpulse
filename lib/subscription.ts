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
  
    console.log('Full user subscription data:', JSON.stringify(user, null, 2));
    
    if (!user) {
      console.log('No user found with ID:', userId);
      return false;
    }
  
    const isValid = user.subscriptionStatus === 'active' && 
      (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > new Date());
    
    console.log('Subscription check details:', {
      status: user.subscriptionStatus,
      endDate: user.subscriptionEndDate,
      isValid
    });
    
    return isValid;
};