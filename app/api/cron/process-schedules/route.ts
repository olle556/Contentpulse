import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format, subMinutes } from 'date-fns';

export const maxDuration = 300; // Set to 5 minutes (300 seconds) for Pro plan?
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Update the prisma client initialization to ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Update the delay utility function to return a Promise
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add more specific error handling
const isTimeoutError = (error: any) => {
  return error.message?.includes('FUNCTION_INVOCATION_TIMEOUT') ||
         error.message?.includes('Task timed out');
};

const isRateLimitError = (error: any) => {
  return error.status === 429 || 
         error.status === 529 || 
         error.message?.includes('rate limit');
};

// Update the generate post function to handle timeouts better
const generatePostWithTimeout = async (params: {
  sourceUrl: string,
  platform: string,
  tone: string,
  useEmojis: boolean,
  userId: string,
  instructions: string,
  baseUrl: string,
  scrapedContent?: string
}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // Increase to 120 seconds

  try {
    const response = await fetch(`${params.baseUrl}/api/generate-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate post: ${errorText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

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

    // Process schedules sequentially with proper delays
    for (const schedule of schedulesToProcess) {
      try {
        const source = await prisma.contentSource.findUnique({
          where: { id: schedule.contentSourceId }
        });

        if (!source) {
          console.error(`Source not found for schedule ${schedule.id}`);
          continue;
        }

        // Scrape content once
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for scraping

        try {
          const scrapeResponse = await fetch(`${baseUrl}/api/firecrawl`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: source.url }),
            signal: controller.signal,
          });

          if (!scrapeResponse.ok) {
            throw new Error(`Failed to scrape content: ${await scrapeResponse.text()}`);
          }

          const scrapedData = await scrapeResponse.json();

          // Process each platform
          for (const platform of schedule.platforms) {
            try {
              await generatePostWithTimeout({
                sourceUrl: source.url,
                platform: platform.toLowerCase(),
                tone: schedule.tonality.toLowerCase(),
                instructions: schedule.aiInstructions || '',
                useEmojis: schedule.useEmojis || false,
                userId: schedule.userId,
                baseUrl,
                scrapedContent: scrapedData.content
              });

              console.log(`Successfully generated post for platform ${platform} from schedule ${schedule.id}`);
              
              // Add delay between platform processing
              await delay(5000); // 5 second delay between platforms

            } catch (error) {
              console.error(`Failed to generate post for platform ${platform}:`, error);
            }
          }

          // Delete one-time schedule if needed
          if (!schedule.isRecurring) {
            await prisma.contentSchedule.delete({
              where: { id: schedule.id }
            });
            console.log(`Deleted one-time schedule ${schedule.id}`);
          }

        } catch (error) {
          console.error(`Failed to process schedule ${schedule.id}:`, error);
        } finally {
          clearTimeout(timeoutId);
        }

        // Add delay between schedules
        await delay(10000); // Increased to 10 second delay between schedules

      } catch (error) {
        console.error(`Failed to process schedule ${schedule.id}:`, error);
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