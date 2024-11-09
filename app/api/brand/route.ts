import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brand = await prisma.brand.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error('Failed to fetch brand:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}
