"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSourceList } from "@/components/sources/content-source-list";
import { AddSourceDialog } from "@/components/sources/add-source-dialog";
import { ContentSource } from "@/types";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function SourcesPage() {
  const { markStepCompleted } = useOnboarding();
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: sources = [], refetch: refreshSources } = useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const response = await fetch('/api/sources');
      const data = await response.json();
      if (data.success) {
        return data.sources;
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data in cache for 30 minutes
  });

  // Create a wrapper function that returns void
  const handleRefresh = async () => {
    await refreshSources();
  };

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
      setAnalysis(data.analysis);
      
      if (data.source) {
        await refreshSources();
        await markStepCompleted('sources');
      }
    } catch (error) {
      console.error('Error analyzing URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full">Content Sources</h1>
        <Button onClick={() => setIsAddSourceOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <div className="mt-6">
        <ContentSourceList 
          sources={sources} 
          onSourceDeleted={handleRefresh}
        />
      </div>
      
      <AddSourceDialog 
        open={isAddSourceOpen} 
        onOpenChange={setIsAddSourceOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
