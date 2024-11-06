import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const sources = await prisma.contentSource.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, sources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch sources' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "Not authenticated" 
      }, { status: 401 });
    }

    const { url } = await req.json();

    const contentSource = await prisma.contentSource.create({
      data: {
        url,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: contentSource 
    });
  } catch (error) {
    console.error("Error in POST /api/sources:", error);
    return NextResponse.json({ 
      error: "Internal Server Error" 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}