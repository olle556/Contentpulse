import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

// Add cache configuration
export const revalidate = 3600; // Cache for 1 hour
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

    const count = await db.generatedPost.count({
      where: {
        userId: session.user.id
      }
    });

    // Add cache headers to the response
    return NextResponse.json(
      { success: true, count },
      {
        headers: {
          'Cache-Control': 'max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
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