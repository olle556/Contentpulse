// app/api/user/delete/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all related records first using a transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: session.user.email! },
        include: { 
          posts: true,
          sources: true,
          brands: true,
          contentSchedules: true,
          onboardingProgress: true,
          accounts: true,
          sessions: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Delete related records
      await tx.generatedPost.deleteMany({
        where: { userId: user.id }
      });

      await tx.contentSchedule.deleteMany({
        where: { userId: user.id }
      });

      await tx.contentSource.deleteMany({
        where: { userId: user.id }
      });

      await tx.brand.deleteMany({
        where: { userId: user.id }
      });

      await tx.onboardingProgress.deleteMany({
        where: { userId: user.id }
      });

      await tx.account.deleteMany({
        where: { userId: user.id }
      });

      await tx.session.deleteMany({
        where: { userId: user.id }
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: user.id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}