import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Anthropic } from '@anthropic-ai/sdk';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { sourceUrl, platform, tone } = await request.json();

    if (!sourceUrl || !platform || !tone) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Get base URL with fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // 1. First, scrape the content using Firecrawl
    const scrapeUrl = `${baseUrl}/api/firecrawl`;
    console.log('Attempting to scrape from:', scrapeUrl); // Debug log

    const scrapeResponse = await fetch(scrapeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: sourceUrl }),
    });

    if (!scrapeResponse.ok) {
      throw new Error(`Failed to scrape URL: ${scrapeResponse.statusText}`);
    }

    // Parse the JSON response instead of getting text
    const scrapedData = await scrapeResponse.json();

    if (!scrapedData.success) {
      throw new Error(scrapedData.error || 'Failed to scrape content');
    }

    // Use the content from the JSON response
    const scrapedContent = scrapedData.content;

    if (!scrapedContent) {
      throw new Error('No content scraped from URL');
    }

    // 2. Create a platform-specific prompt
    const platformLimits = {
      twitter: '280 characters',
      linkedin: '3000 characters',
      facebook: 'no strict limit, but aim for concise content',
      threads: '500 characters',
    };

    const prompt = `You are a social media content creator. Your task is to create an engaging ${platform} post using a ${tone} tone based on the following source material.

Source URL: ${sourceUrl}
Scraped Content:
${scrapedContent}

Instructions:
1. Create a single, engaging post for ${platform} (limit: ${platformLimits[platform as keyof typeof platformLimits]})
2. Maintain a ${tone} tone throughout the post
3. Include key information and insights from the source
4. Make it conversational and engaging
5. For Twitter/X, include relevant hashtags
6. For LinkedIn, focus on professional insights
7. For Facebook, aim for engaging, shareable content
8. For Threads, create concise, discussion-worthy content${platform === 'threads' ? ' and consider using emojis appropriately' : ''}

Additional tone guidance for "${tone}":
${tone === 'professional' ? '- Use industry-appropriate terminology\n- Maintain business etiquette\n- Focus on value and insights' :
  tone === 'casual' ? '- Use conversational language\n- Be friendly and approachable\n- Feel free to use common expressions' :
  tone === 'funny' ? '- Include appropriate humor\n- Use wordplay or puns if relevant\n- Keep it light but informative' :
  tone === 'creative' ? '- Use unique perspectives\n- Include metaphors or analogies\n- Be imaginative in presentation' :
  '- Use formal language\n- Maintain strict professionalism\n- Focus on facts and accuracy'}
In you answer, exclude the following:
Any explanation of the content, just the post.

Please generate the post now:`;

    // 3. Generate post using Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const generatedContent = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // 4. Save the generated post to the database with the correct userId
    const savedPost = await prisma.generatedPost.create({
      data: {
        content: generatedContent,
        platform,
        status: 'draft',
        userId: session.user.id, // Use the authenticated user's ID
      },
    });

    // 5. Return the response
    return NextResponse.json({
      success: true,
      content: generatedContent,
      post: savedPost,
      sourceUrl,
    });

  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
