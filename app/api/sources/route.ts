import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
