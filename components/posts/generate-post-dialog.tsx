"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ContentSource } from "@/types";
import { Loader2 } from "lucide-react";

interface GeneratePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeneratePostDialog({ open, onOpenChange }: GeneratePostDialogProps) {
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingPost, setGeneratingPost] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [usedSources, setUsedSources] = useState<string[]>([]);

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      if (data.success) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast.error('Failed to fetch sources');
    }
  }

  async function handleSourceSelect(sourceId: string) {
    const isSelected = selectedSources.includes(sourceId);
    if (isSelected) {
      setSelectedSources(selectedSources.filter(id => id !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  }

  async function handleGenerate() {
    if (selectedSources.length === 0) {
      toast.error("Please select at least one source");
      return;
    }

    setGeneratingPost(true);

    try {
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceIds: selectedSources }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setGeneratedContent(data.content);
      setUsedSources(data.sourceUrls); // Store the used source URLs
      toast.success('Post generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate post');
    } finally {
      setGeneratingPost(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Post from Sources</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Sources</Label>
            <div className="grid gap-2 max-h-[200px] overflow-y-auto">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={() => handleSourceSelect(source.id)}
                  />
                  <Label htmlFor={source.id} className="cursor-pointer">
                    {source.url} ({source.category})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {generatedContent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Generated Content</Label>
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={5}
                />
              </div>
              
              {usedSources.length > 0 && (
                <div className="space-y-2">
                  <Label>Sources Used:</Label>
                  <div className="text-sm text-muted-foreground">
                    {usedSources.map((url, index) => (
                      <div key={index}>• {url}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={generatingPost || selectedSources.length === 0}
            >
              {generatingPost ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Post'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
