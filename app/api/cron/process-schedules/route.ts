import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format, subMinutes } from 'date-fns';

export const maxDuration = 290; // Set max duration to 5 minutes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('[CRON] Starting schedule processing');

    const now = new Date();
    const fiveMinutesAgo = subMinutes(now, 5);

    const currentTime = format(now, 'HH:mm');
    const today = format(now, 'yyyy-MM-dd');

    console.log('[CRON] Time range:', {
      start: format(fiveMinutesAgo, 'HH:mm'),
      end: format(now, 'HH:mm')
    });

    // Wrap database operations in a transaction
    const schedulesToProcess = await prisma.$transaction(async (tx) => {
      return tx.contentSchedule.findMany({
        where: {
          OR: [
            // One-time schedules within last 5 minutes
            {
              isRecurring: false,
              date: {
                gte: new Date(today + ' 00:00:00'),
                lt: new Date(today + ' 23:59:59'),
              },
              time: {
                gte: format(fiveMinutesAgo, 'HH:mm'),
                lte: currentTime,
              },
            },
            // Recurring schedules within last 5 minutes
            {
              isRecurring: true,
              recurringDays: {
                has: format(now, 'EEE').toLowerCase(), // e.g., 'mon', 'tue', etc.
              },
              time: {
                gte: format(fiveMinutesAgo, 'HH:mm'),
                lte: currentTime,
              },
            },
          ],
        },
        include: {
          user: true,
        },
      });
    });

    console.log(`Found ${schedulesToProcess.length} schedules to process`);

    if (schedulesToProcess.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        processed: 0
      }), { status: 200 });
    }

    // Process schedules within a transaction
    await prisma.$transaction(async (tx) => {
      for (const schedule of schedulesToProcess) {
        const source = await tx.contentSource.findUnique({
          where: { id: schedule.contentSourceId }
        });

        if (!source) {
          console.error(`Source not found for schedule ${schedule.id}`);
          continue;
        }

        // Generate post for each schedule
        try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          console.log('starting fetch for schedule', schedule.id);

          const response = await fetch(`${baseUrl}/api/generate-post`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.CRON_SECRET}`, // Use CRON_SECRET for authentication
            },
            body: JSON.stringify({
              sourceUrl: source.url,
              platform: schedule.platforms[0].toLowerCase(),
              tone: schedule.tonality.toLowerCase(),
              instructions: schedule.aiInstructions || '',
              useEmojis: schedule.useEmojis || false,
              userId: schedule.userId, // Pass the userId from the schedule
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate post: ${await response.text()}`);
          }

          const data = await response.json();
          // Handle successful response if needed

        } catch (error) {
          console.error(`Failed to generate post for schedule ${schedule.id}:`, error);
          // Continue with next schedule instead of breaking the entire process
          continue;
        }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      processed: schedulesToProcess.length
    }), { status: 200 });

  } catch (error) {
    console.error('[CRON] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process schedules'
    }), { status: 500 });
  } finally {
    // Single disconnect in finally block
    await prisma.$disconnect();
  }
}