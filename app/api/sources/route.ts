import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { revalidateTag } from 'next/cache';

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

    const sources = await prisma.contentSource.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, sources });
  } catch (error) {
    console.error('Detailed error fetching sources:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch sources' 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { url } = await req.json();

    // Use a transaction to ensure data consistency and optimize queries
    const result = await prisma.$transaction(async (tx) => {
      // Add type assertion or null check for email
      const email = session.user.email;
      if (!email) {
        throw new Error("Email is required");
      }

      const user = await tx.user.findUnique({
        where: { 
          email: session.user.email as string 
        },
        select: { id: true }
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check for duplicate URLs for this user
      const existingSource = await tx.contentSource.findFirst({
        where: {
          userId: user.id,
          url: url,
        },
        select: { id: true }
      });

      if (existingSource) {
        throw new Error("URL already exists for this user");
      }

      // Create the new source
      return await tx.contentSource.create({
        data: {
          url,
          userId: user.id,
        },
        select: {
          id: true,
          url: true,
          createdAt: true,
          // Only select fields you need
        }
      });
    });

    revalidateTag('sources');

    return NextResponse.json({ 
      success: true, 
      data: result 
    });
      
  } catch (error: unknown) {
    console.error("Detailed error in POST /api/sources:", error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message === "URL already exists for this user") {
        return NextResponse.json({ 
          error: error.message 
        }, { status: 409 }); // Conflict status code
      }
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  }
}