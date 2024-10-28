import { NextResponse } from 'next/server';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({ apiKey: process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY || "" });

export async function POST(request: Request) {
  const supabase = createClientComponentClient();
  
  try {
    const { sourceId } = await request.json();
    
    // Get source details from database
    const { data: source } = await supabase
      .from("content_sources")
      .select("*")
      .eq("id", sourceId)
      .single();
    
    if (!source) {
      return NextResponse.json({ 
        success: false, 
        error: "Source not found" 
      }, { status: 404 });
    }

    // Use Firecrawl to get content
    const crawlResponse = await app.asyncCrawlUrl(source.url, {
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

    // Update source with scraped content
    const { error: updateError } = await supabase
      .from("content_sources")
      .update({
        scrapedContent: status.data.map(item => item.markdown).join('\n\n---\n\n'),
        lastCrawled: new Date().toISOString()
      })
      .eq("id", sourceId);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true,
      message: "Source scraped successfully"
    });

  } catch (error) {
    console.error('Error scraping source:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to scrape source' 
    }, { status: 500 });
  }
}