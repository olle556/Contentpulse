import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const posts = await prisma.generatedPost.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      posts 
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch posts' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { content, platform, status } = await request.json();
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content is required' 
      }, { status: 400 });
    }

    const post = await prisma.generatedPost.create({
      data: {
        content,
        platform: platform || 'twitter',
        status: status || 'draft',
        user: {
          connect: {
            email: session.user.email
          }
        }
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      post 
    });

  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save post' 
    }, { status: 500 });
  }
}
