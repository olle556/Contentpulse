import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const schedule = await prisma.contentSchedule.delete({
      where: { id: params.id },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}