"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSourceList } from "@/components/sources/content-source-list";
import { AddSourceDialog } from "@/components/sources/add-source-dialog";
import { ContentSource } from "@/types";

export default function SourcesPage() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<ContentSource[]>([]);

  const handleAnalyzeUrl = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/firecrawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      console.log('Scraped content:', data.content);
      setAnalysis(data.analysis);
      
      if (data.source) {
        setSources(prevSources => [...prevSources, data.source]);
      }
    } catch (error) {
      console.error('Error analyzing URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSources = async () => {
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      if (data.success) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  useEffect(() => {
    refreshSources();
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Content Sources</h1>
        <Button 
          onClick={() => setIsAddSourceOpen(true)} 
          className="flex items-center w-full sm:w-auto"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <div className="mt-6">
        <ContentSourceList 
          sources={sources} 
          onSourceDeleted={refreshSources}
        />
      </div>
      
      <AddSourceDialog 
        open={isAddSourceOpen} 
        onOpenChange={setIsAddSourceOpen}
        onSuccess={refreshSources}
      />
    </div>
  );
}
