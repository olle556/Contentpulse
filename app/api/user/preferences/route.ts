import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { notificationOn } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        preferences: {
          notificationOn
        }
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}