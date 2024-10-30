import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    // For now, fetch all sources without user filtering
    const sources = await prisma.contentSource.findMany({
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
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Add debug logs
    console.log("API Route - Session:", session);
    console.log("API Route - User:", session?.user);

    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { url } = await req.json();

    const contentSource = await prisma.contentSource.create({
      data: {
        url,
        userId: session.user.id,
      },
    });

    return new Response(JSON.stringify({ success: true, data: contentSource }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/sources:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
