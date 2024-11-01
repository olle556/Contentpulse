import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET() {
  try {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    
    // Find all schedules that should be processed now
    const schedulesToProcess = await prisma.contentSchedule.findMany({
      where: {
        OR: [
          // One-time schedules
          {
            isRecurring: false,
            date: now,
            time: currentTime,
          },
          // Recurring schedules
          {
            isRecurring: true,
            recurringDays: {
              has: format(now, 'EEE').toLowerCase(), // e.g., 'mon', 'tue', etc.
            },
            time: currentTime,
          },
        ],
      },
      include: {
        user: true,
      },
    });

    for (const schedule of schedulesToProcess) {
      // Generate post for each schedule
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceUrl: schedule.contentSourceId, // rätt????
          platform: schedule.platforms[0], // CHANGE! tar bara första plattformen. You might want to generate for each platform
          tone: schedule.tonality,
          useEmojis: schedule.useEmojis,
          aiInstructions: schedule.aiInstructions,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to generate post for schedule ${schedule.id}`);
        continue;
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: schedulesToProcess.length 
    });
  } catch (error) {
    console.error('Error processing schedules:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process schedules' 
    }, { status: 500 });
  }
}