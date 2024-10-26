"use client";

import { useState } from "react";
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({ apiKey: process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY || "" });

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");

  const handleCrawl = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setMarkdownContent("");

    try {
      // Use asyncCrawlUrl instead of crawlUrl
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
        throw new Error(`Failed to crawl: ${crawlResponse.error}`);
      }

      // Use checkCrawlStatus instead of getCrawlStatus
      const pollStatus = async (crawlId: string) => {
        const status = await app.checkCrawlStatus(crawlId);
        
        if (!status.success) {
          throw new Error(`Failed to check status: ${status.error}`);
        }

        if (status.status === "completed") {
          const combinedMarkdown = status.data
            .map(item => `## ${item.url}\n\n${item.markdown}`)
            .join('\n\n---\n\n');
          setMarkdownContent(combinedMarkdown || "No content found");
          setLoading(false);
        } else if (status.status === "failed") {
          throw new Error("Crawl failed");
        } else {
          // Poll again after 2 seconds
          setTimeout(() => pollStatus(crawlId), 2000);
        }
      };

      // Start polling
      //await pollStatus(crawlResponse.ID);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };
}
