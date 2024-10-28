"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSourceList } from "@/components/sources/content-source-list";
import { AddSourceDialog } from "@/components/sources/add-source-dialog";
import { Input } from "@/components/ui/input";
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
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      setAnalysis(data.analysis);
      
      // Refresh the sources list
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

  // Add useEffect to load sources initially
  useEffect(() => {
    refreshSources();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Sources</h1>
        <Button onClick={() => setIsAddSourceOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <div className="flex gap-4">
        <Input 
          placeholder="Enter URL to analyze" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button 
          onClick={handleAnalyzeUrl} 
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
          <p className="whitespace-pre-wrap">{analysis}</p>
        </div>
      )}

      <ContentSourceList sources={sources} />
      <AddSourceDialog 
        open={isAddSourceOpen} 
        onOpenChange={setIsAddSourceOpen}
        onSuccess={refreshSources}
      />
    </div>
  );
}
