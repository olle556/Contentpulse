import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // First, ensure we have a default user
    let defaultUser = await prisma.user.findFirst({
      where: {
        email: 'default@example.com'
      }
    });

    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User',
        }
      });
    }

    // Fetch content using firecrawl route
    const crawlResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/firecrawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!crawlResponse.ok) {
      throw new Error('Failed to crawl URL');
    }

    const { content: URLContent } = await crawlResponse.json();
    console.log(URLContent);

    // Create a simple HTML to text converter
    //const textContent = htmlContent.replace(/<[^>]*>/g, ' ')
      //.replace(/\s+/g, ' ')
      //.trim();

    // Send to Claude for analysis
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a social media post. Analyze the following webpage content and provide a comprehensive summary of its main topics, key points, and overall purpose. If relevant, identify the target audience and content quality. Here's the content:

        ${URLContent.substring(0, 10000)} // Limiting content length to avoid token limits
        `
      }]
    });

    // Access the content safely
    const analysis = typeof message.content[0] === 'string' 
      ? message.content[0]
      : message.content[0].type === 'text' 
        ? message.content[0].text
        : '';

    // Save to database using the default user's ID
    const contentSource = await prisma.contentSource.create({
      data: {
        url,
        category: 'website',
        crawlFrequency: 'daily',
        userId: defaultUser.id, // Use the default user's ID
      },
    });

    return NextResponse.json({ 
      success: true, 
      analysis,
      source: contentSource
    });

  } catch (error) {
    console.error('Error processing URL:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to analyze URL'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
