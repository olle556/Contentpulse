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

// Add this interface near the top of the file
interface GeneratedPost {
  platform: string;
  content: string;
}

// Update the generate post function to return the generated content
const generatePostWithTimeout = async (params: {
  sourceUrl: string,
  platform: string,
  tone: string,
  useEmojis: boolean,
  userId: string,
  instructions: string,
  baseUrl: string,
  threadCount: number,
  scrapedContent?: string
}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // Reduced to 120 seconds (2 minutes)

  try {
    // Ensure threadCount is properly passed for supported platforms
    const platformsWithThreads = ['twitter', 'twitter_premium', 'threads', 'X', 'X Premium'];
    const finalThreadCount = platformsWithThreads.includes(params.platform.toLowerCase()) 
      ? params.threadCount 
      : 1;

    const response = await fetch(`${params.baseUrl}/api/generate-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({
        ...params,
        threadCount: finalThreadCount,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate post: ${errorText}`);
    }

    const result = await response.json();
    return result; // This now includes the generated content
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
      timeout: 60000 // Increase timeout to 60 seconds
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

        // Initialize array to collect all generated posts
        const generatedPosts: GeneratedPost[] = [];

        // Scrape content once
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for scraping

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
              const result = await generatePostWithTimeout({
                sourceUrl: source.url,
                platform: platform.toLowerCase(),
                tone: schedule.tonality.toLowerCase(),
                instructions: schedule.aiInstructions || '',
                useEmojis: schedule.useEmojis || false,
                userId: schedule.userId,
                baseUrl,
                threadCount: schedule.threadCount || 1,
                scrapedContent: scrapedData.content
              });

              // Collect successful generations
              if (result.success && result.content) {
                generatedPosts.push({
                  platform,
                  content: result.content
                });
              }

              console.log(`Successfully generated post for platform ${platform} from schedule ${schedule.id}`);
            } catch (error) {
              console.error(`Failed to generate post for platform ${platform}:`, error);
            }
          }

          // Send single email with all generated posts
          if (generatedPosts.length > 0) {
            // Check user's notification preference
            const userPreferences = schedule.user.preferences as { notificationOn?: boolean } | null;
            const notificationsEnabled = userPreferences?.notificationOn ?? true; // Default to true if not set

            if (notificationsEnabled) {
              try {
                await fetch(`${baseUrl}/api/postMail`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: schedule.user.email,
                    userId: schedule.userId,
                    generatedPosts: generatedPosts,
                    scheduleId: schedule.id,
                    sourceUrl: source.url
                  }),
                });
                console.log(`Email notification sent for schedule ${schedule.id}`);
              } catch (emailError) {
                console.error(`Failed to send email notification:`, emailError);
              }
            } else {
              console.log(`Email notification skipped for schedule ${schedule.id} - notifications disabled`);
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
        await delay(2000); // 2 second delay between schedules

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