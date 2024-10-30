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

    const crawlResponse = await app.crawlUrl(url, {
      maxDepth: 1,
      limit: 10000,
      allowExternalLinks: false,
      allowBackwardLinks: false,
      scrapeOptions: {
        formats: ["markdown"],
      },
    });

    console.log('hej');

    if (!crawlResponse.success) {
      return NextResponse.json({
        success: false,
        error: crawlResponse.error
      }, { status: 400 });
    }

    console.log(crawlResponse);

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

    return NextResponse.json({
      success: true,
      content: markdownContent
    });

  } catch (error) {
    console.error('Error processing URL:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process URL'
    }, { status: 500 });
  }
}
