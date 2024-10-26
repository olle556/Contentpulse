import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // First, fetch the content from the URL
    const response = await fetch(url);
    const htmlContent = await response.text();

    // Create a simple HTML to text converter (you might want to use a library like 'cheerio' for better parsing)
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Send to Claude for analysis
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analyze the following webpage content and provide a comprehensive summary of its main topics, key points, and overall purpose. If relevant, identify the target audience and content quality. Here's the content:

        ${textContent.substring(0, 10000)} // Limiting content length to avoid token limits
        `
      }]
    });

    return NextResponse.json({ 
      success: true, 
      analysis: message.content[0].text 
    });

  } catch (error) {
    console.error('Error processing URL:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze URL' 
    }, { status: 500 });
  }
}