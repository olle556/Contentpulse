import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const posts = await prisma.generatedPost.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true // Include this if you need user data
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
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content is required' 
      }, { status: 400 });
    }

    const post = await prisma.generatedPost.update({
      where: { id: params.id },
      data: { content },
    });

    return NextResponse.json({ 
      success: true, 
      post 
    });

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update post' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.generatedPost.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete post' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}