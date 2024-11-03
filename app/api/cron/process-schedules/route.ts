import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

// Modify the getPrismaClient function
async function getPrismaClient() {
  if (process.env.NODE_ENV === 'production') {
    // Ensure any existing connections are closed first
    await prisma.$disconnect();
    // Create a fresh connection
    await prisma.$connect();
  }
  return prisma;
}

export async function GET() {
  let client;
  try {
    client = await getPrismaClient();
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const today = format(now, 'yyyy-MM-dd');

    console.log('Cron job started at:', new Date().toISOString());
    console.log('Looking for schedules at time:', currentTime);

    console.log('Query parameters:', {
      date: today,
      time: currentTime,
    });

    // Find all schedules that should be processed now
    const schedulesToProcess = await client.contentSchedule.findMany({
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
    console.log('Current time:', currentTime);

    for (const schedule of schedulesToProcess) {
      // First get the source URL using the contentSourceId
      const source = await client.contentSource.findUnique({
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
          sourceUrl: source.url, // Use the source URL here
          platform: schedule.platforms[0],
          tone: schedule.tonality,
          useEmojis: schedule.useEmojis,
          instructions: schedule.aiInstructions,
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
  } finally {
    // Always disconnect in production, regardless of success or failure
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}