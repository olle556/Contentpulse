import { NextResponse } from 'next/server';
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({ apiKey: process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ 
        success: false, 
        error: "Please provide a URL" 
      }, { status: 400 });
    }

    const crawlResponse = await app.asyncCrawlUrl(url, {
      maxDepth: 1,
      limit: 6,
      allowExternalLinks: false,
      allowBackwardLinks: false,
      scrapeOptions: {
        formats: ["markdown"],
      },
    });

    if (!crawlResponse.success) {
      return NextResponse.json({ 
        success: false, 
        error: crawlResponse.error 
      }, { status: 400 });
    }

    const status = await app.checkCrawlStatus(crawlResponse.id);
    
    if (!status.success) {
      return NextResponse.json({ 
        success: false, 
        error: status.error 
      }, { status: 400 });
    }

    const combinedMarkdown = status.data
      .map(item => `## ${item.url}\n\n${item.markdown}`)
      .join('\n\n---\n\n');

    return NextResponse.json({ 
      success: true, 
      content: combinedMarkdown 
    });

  } catch (error) {
    console.error('Error processing URL:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process URL' 
    }, { status: 500 });
  }
}
