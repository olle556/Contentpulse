import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { generateWithClaude } from '@/lib/claude'; // Assuming this is your Claude integration

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { scrapedContent, platform, tone, useEmojis, aiInstructions } = await request.json();
    
    if (!scrapedContent) {
      return NextResponse.json({ 
        success: false, 
        error: 'Scraped content is required for regeneration' 
      }, { status: 400 });
    }

    // Generate new content using Claude with the existing scraped content
    const generatedContent = await generateWithClaude({
      scrapedContent,
      platform,
      tone,
      useEmojis,
      aiInstructions
    });

    return NextResponse.json({ 
      success: true, 
      content: generatedContent,
      post: {
        content: generatedContent,
        platform,
        status: 'draft'
      }
    });

  } catch (error) {
    console.error('Error in POST /api/generate-post/regenerate:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to regenerate post' 
    }, { status: 500 });
  }
}
