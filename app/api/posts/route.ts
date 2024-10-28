import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function (should be at the top of the file)
async function ensureDefaultUser() {
  try {
    let defaultUser = await prisma.user.findFirst({
      where: { 
        email: 'default@example.com'
      }
    });

    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User',
        }
      });
    }

    return defaultUser;
  } catch (error) {
    console.error('Error ensuring default user:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const defaultUser = await ensureDefaultUser();
    console.log('Default user:', defaultUser); // Debug log
    
    const posts = await prisma.generatedPost.findMany({
      where: {
        userId: defaultUser.id // Make sure we're using the correct user ID
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true // Include user data if needed
      }
    });

    console.log('Found posts:', posts); // Debug log

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
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const defaultUser = await ensureDefaultUser();
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
        userId: defaultUser.id,
      },
    });

    console.log('Created post:', post); // Debug log

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
  } finally {
    await prisma.$disconnect();
  }
}
