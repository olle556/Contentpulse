"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const shortText = "Manage your content sources to base posts on up-to-date information.";
  const fullText = "Manage your content sources to base posts on up-to-date information. Posts will pull the latest data from your provided URLs. Pro tip: Use dynamic sources, like an economy news homepage, instead of static articles.";

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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

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
        console.log('Marking sources step as completed after URL analysis');
        await markStepCompleted('sources');
      }
    } catch (error) {
      console.error('Error analyzing URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceAdded = async () => {
    await refreshSources();
    console.log('Marking sources step as completed after adding source');
    await markStepCompleted('sources');
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-left">Content Sources</h1>

        <Button onClick={() => setIsAddSourceOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <div className="text-muted-foreground text-left">
        <p className="hidden md:block">
          {fullText}
        </p>

        <div className="md:hidden">
          <p>{isTextExpanded ? fullText : shortText}</p>
          <Button 
            variant="ghost" 
            className="mt-2 h-8 px-2 text-xs"
            onClick={() => setIsTextExpanded(!isTextExpanded)}
          >
            {isTextExpanded ? (
              <div className="flex items-center">
                Show Less <ChevronUp className="ml-1 h-4 w-4" />
              </div>
            ) : (
              <div className="flex items-center">
                Show More <ChevronDown className="ml-1 h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
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
        onSuccess={handleSourceAdded}
      />
    </div>
  );
}
