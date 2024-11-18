import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { revalidateTag } from 'next/cache';

// Add cache configuration
export const dynamic = 'force-dynamic'; // Needed for authentication to work with caching

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const count = await db.contentSource.count({
      where: {
        userId: session.user.id,

      }
    });

    console.log('Current sources count:', count, 'for user:', session.user.id);

    return NextResponse.json(
      { success: true, count },
      {
        headers: {
          'Cache-Control': 'public, max-age=5, s-maxage=5',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch posts count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts count' },
      { status: 500 }
    );
  }
}