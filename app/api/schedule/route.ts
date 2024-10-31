import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const schedule = await prisma.contentSchedule.create({
      data: {
        userId: user.id,
        contentSourceId: data.contentSourceId,
        tonality: data.tonality,
        platforms: data.platforms,
        isRecurring: data.isRecurring,
        recurringDays: data.recurringDays || [],
        startDate: data.startDate,
        date: data.date,
        time: data.time,
        aiInstructions: data.aiInstructions,
      },
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error creating schedule:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}