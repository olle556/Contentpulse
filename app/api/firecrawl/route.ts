import { NextResponse } from 'next/server';
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY || "" });

export const maxDuration = 60; // Set to 1 minute instead of 2

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50000); // Set to 50 seconds

  try {
    if (!process.env.FIRECRAWL_API_KEY) {
      console.error('Firecrawl API key not configured - Missing FIRECRWAL_API_KEY');
      return NextResponse.json({
        success: false,
        error: "Service configuration error - Missing FIRECRWAL_API_KEY"
      }, { status: 503 });
    }

    const { url } = await request.json();
    console.log('Received URL in Firecrawl:', url);

    if (!url) {
      return NextResponse.json({
        success: false,
        error: "Please provide a URL"
      }, { status: 400 });
    }

    console.log('Attempting to crawl URL:', url);
    const crawlResponse = await app.crawlUrl(url, {
      maxDepth: 0,
      limit: 1,
      allowExternalLinks: false,
      allowBackwardLinks: false,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      }
    });

    console.log('Crawl response:', crawlResponse);

    if (!crawlResponse.success) {
      console.error('Crawl failed:', crawlResponse.error);
      return NextResponse.json({
        success: false,
        error: crawlResponse.error || 'Crawl failed'
      }, { status: 400 });
    }

    let markdownContent = "";

    switch (crawlResponse.status) {
      case "completed":
        markdownContent = crawlResponse.data
          .map(item => item.markdown)
          .join('\n\n') || "No content found";
        break;
      case "failed":
        console.error('Crawl status failed');
        throw new Error("Crawl failed");
      default:
        console.error('Unknown crawl status:', crawlResponse.status);
    }

    return NextResponse.json({
      success: true,
      content: markdownContent
    });

  } catch (error: any) {
    console.error('Error processing URL:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        error: "Request timed out"
      }, { status: 408 });
    }
    
    if (error.statusCode === 402) {
      return NextResponse.json({
        success: false,
        error: "Service temporarily unavailable. Please try again later with a smaller request."
      }, { status: 402 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process URL'
    }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}