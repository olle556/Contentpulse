import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET() {
  try {
    // Add disconnect at start to ensure clean connection
    await prisma.$disconnect();
    
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const today = format(now, 'yyyy-MM-dd');

    //console.log('Cron job started at:', new Date().toISOString());
    console.log('Looking for schedules at time:', currentTime);

    //console.log('Query parameters:', {
    //  date: today,
    //  time: currentTime,
    //});

    // Find all schedules that should be processed now
    const schedulesToProcess = await prisma.contentSchedule.findMany({
      where: {
        OR: [
          // One-time schedules
          {
            isRecurring: false,
            date: {
              gte: new Date(today + ' 00:00:00'),
              lt: new Date(today + ' 23:59:59'),
            },
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

    console.log(`Found ${schedulesToProcess.length} schedules to process`);
    //console.log('Current time:', currentTime);

    // Add early return if no schedules found
    if (schedulesToProcess.length === 0) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: true,
        processed: 0
      });
    }

    for (const schedule of schedulesToProcess) {
      const source = await prisma.contentSource.findUnique({
        where: { id: schedule.contentSourceId }
      });

      if (!source) {
        console.error(`Source not found for schedule ${schedule.id}`);
        continue;
      }

      // Generate post for each schedule
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceUrl: source.url,
          platform: schedule.platforms[0],
          tone: schedule.tonality,
          useEmojis: schedule.useEmojis,
          instructions: schedule.aiInstructions,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to generate post for schedule ${schedule.id}`);
      }
    }

    await prisma.$disconnect();
    return NextResponse.json({
      success: true,
      processed: schedulesToProcess.length
    });

  } catch (error) {
    console.error('Error processing schedules:', error);
    await prisma.$disconnect();
    return NextResponse.json({
      success: false,
      error: 'Failed to process schedules'
    }, { status: 500 });
  }
}