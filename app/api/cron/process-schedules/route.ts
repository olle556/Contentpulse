import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format, subMinutes } from 'date-fns';

export const maxDuration = 290; // Set max duration to 5 minutes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Update the prisma client initialization to ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

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

    // First transaction to get schedules
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
                gt: format(fiveMinutesAgo, 'HH:mm'),
                lte: currentTime,
              },
            },
            // Recurring schedules within last 5 minutes
            {
              isRecurring: true,
              startDate: {
                lte: new Date(today + ' 23:59:59'), // Only include schedules where startDate is today or earlier
              },
              recurringDays: {
                has: format(now, 'EEE'),
              },
              time: {
                gt: format(fiveMinutesAgo, 'HH:mm'),
                lte: currentTime,
              },
            },
          ],
        },
        include: {
          user: true,
        },
      });
    }, {
      timeout: 30000 // Increase timeout to 30 seconds n
    });

    console.log(`Found ${schedulesToProcess.length} schedules to process`);

    if (schedulesToProcess.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        processed: 0
      }), { status: 200 });
    }

    // Process schedules outside of transaction
    for (const schedule of schedulesToProcess) {
      try {
        const source = await prisma.contentSource.findUnique({
          where: { id: schedule.contentSourceId }
        });

        if (!source) {
          console.error(`Source not found for schedule ${schedule.id}`);
          continue;
        }

        // Generate a post for each platform
        for (const platform of schedule.platforms) {
          try {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const response = await fetch(`${baseUrl}/api/generate-post`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET}`, //identify the cron job
              },
              body: JSON.stringify({
                sourceUrl: source.url,
                platform: platform.toLowerCase(), 
                tone: schedule.tonality.toLowerCase(),
                instructions: schedule.aiInstructions || '',
                useEmojis: schedule.useEmojis || false,
                userId: schedule.userId,
              }),
            });

            if (!response.ok) {
              throw new Error(`Failed to generate post for platform ${platform}: ${await response.text()}`);
            }

            await response.json();
            console.log(`Successfully generated post for platform ${platform} from schedule ${schedule.id}`);
          } catch (error) {
            console.error(`Failed to generate post for platform ${platform} from schedule ${schedule.id}:`, error);
            // Continue with other platforms even if one fails
            continue;
          }
        }

        // Delete one-time schedules after successful processing of all platforms
        if (!schedule.isRecurring) {
          await prisma.contentSchedule.delete({
            where: { id: schedule.id }
          });
          console.log(`Deleted one-time schedule ${schedule.id}`);
        }
      } catch (error) {
        console.error(`Failed to generate post for schedule ${schedule.id}:`, error);
      }
    }

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