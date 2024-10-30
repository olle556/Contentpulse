import { NextResponse } from 'next/server';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

    // Use existing firecrawl endpoint instead of direct API call
    const crawlResponse = await fetch('/api/firecrawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: source.url })
    }).then(res => res.json());

    if (!crawlResponse.success) {
      return NextResponse.json({ 
        success: false, 
        error: crawlResponse.error 
      }, { status: 400 });
    }

    // Update source with scraped content
    const { error: updateError } = await supabase
      .from("content_sources")
      .update({
        scrapedContent: crawlResponse.content,
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