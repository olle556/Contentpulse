import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      console.log('User not found for email:', session.user.email);
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    console.log('Fetching sources for user ID:', user.id);

    const sources = await prisma.contentSource.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found sources:', sources.length);

    return NextResponse.json({ success: true, sources });
  } catch (error) {
    console.error('Detailed error fetching sources:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch sources' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in POST:', session);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: "Not authenticated" 
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }

    const { url } = await req.json();

    const contentSource = await prisma.contentSource.create({
      data: {
        url,
        userId: user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: contentSource 
    });
  } catch (error) {
    console.error("Detailed error in POST /api/sources:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}