import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ success: false, error: 'Not allowed in production' }, { status: 403 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Delete related records one by one
    await Promise.all([
      prisma.brand.deleteMany({
        where: { userId: user.id }
      }),
      prisma.contentSource.deleteMany({
        where: { userId: user.id }
      }),
      prisma.generatedPost.deleteMany({
        where: { userId: user.id }
      }),
      prisma.contentSchedule.deleteMany({
        where: { userId: user.id }
      })
    ]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in reset endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}