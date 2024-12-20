// app/api/user/delete/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await req.json();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { 
          posts: true,
          sources: {
            include: {
              scrapedContent: true
            }
          },
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

      // Verify the user is deleting their own account
      if (user.email !== session.user.email) {
        throw new Error('Unauthorized');
      }

      // Delete related records in correct order
      await tx.generatedPost.deleteMany({
        where: { userId: user.id }
      });

      await tx.contentSchedule.deleteMany({
        where: { userId: user.id }
      });

      // Delete ScrapedContent before ContentSource
      for (const source of user.sources) {
        await tx.scrapedContent.deleteMany({
          where: { sourceId: source.id }
        });
      }

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
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: 500 }
    );
  }
}