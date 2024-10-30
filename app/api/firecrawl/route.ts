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

    if (!process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY) {
      console.error('Missing Firecrawl API key');
      return NextResponse.json({
        success: false,
        error: 'Missing API key configuration'
      }, { status: 500 });
    }

    console.log('Attempting to crawl URL:', url);

    const crawlResponse = await app.crawlUrl(url, {
      maxDepth: 1,
      limit: 100000,
      allowExternalLinks: false,
      allowBackwardLinks: false,
      scrapeOptions: {
        formats: ["markdown"],
      },
    });

    console.log('Raw crawl response:', JSON.stringify(crawlResponse, null, 2));

    if (!crawlResponse.success) {
      return NextResponse.json({
        success: false,
        error: crawlResponse.error
      }, { status: 400 });
    }

    console.log('Crawl Response:', crawlResponse);

    let markdownContent = "";

    switch (crawlResponse.status) {
      case "completed":
        markdownContent = crawlResponse.data
          .map(item => item.markdown)
          .join('\n\n') || "No content found";
        break;
      case "failed":
        throw new Error("Crawl failed");
      default:
    }

    console.log('Markdown Content:', markdownContent);

    return NextResponse.json({
      success: true,
      content: markdownContent
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Failed to process URL'
    }, { status: 500 });
  }
}
