import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Anthropic } from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { sourceIds } = await request.json();

    // Fetch content from selected sources
    // const sources = await prisma.contentSource.findMany({
    //   where: {
    //     id: {
    //       in: sourceIds
    //     }
    //   },
    //   include: {
    //     scrapedContent: true
    //   }
    // });
    // Format the content from sources in a more structured way
    // const sourceContexts = sources.map(source => ({
    //   url: source.url,
    //   content: source.scrapedContent.map(content => content.content).join('\n')
    // }));

    // Fetch content using firecrawl route
    const URLContent = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/firecrawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceIds }),
    });

    console.log('generate post API har fåptt response från firecrawl');

    if (!URLContent.ok) {
      throw new Error('Failed to crawl URL');
    }

    const contentText = await URLContent.text();


    // Create a more detailed prompt for Claude
    const prompt = `You are a social media content creator. Your task is to create an engaging social media post based on the following source materials.
Source:
${contentText}

Instructions:
1. Create a single, engaging social media post (maximum 280 characters)
2. The post should directly reference key information from the provided sources
3. Include relevant facts or insights from the source material
4. Make it conversational yet informative
5. Add relevant hashtags if appropriate

Please generate the post now:`;

    // Generate post using Claude
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

    // Log for debugging
    console.log('Source URL:', sourceIds);
    console.log('Generated Content:', generatedContent);

    return NextResponse.json({
      success: true,
      content: generatedContent,
      sourceUrls: sourceIds // Return source URLs for reference
    });

  } catch (error) {
    console.error('Error generating post:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate post'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
