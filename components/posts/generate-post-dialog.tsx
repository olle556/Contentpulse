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
import { toast } from "sonner";
import { ContentSource } from "@/types";
import { Loader2, Check, RefreshCw } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface GeneratePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GeneratePostDialog({ open, onOpenChange, onSuccess }: GeneratePostDialogProps) {
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [generatingPost, setGeneratingPost] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPost, setSavedPost] = useState<any>(null);

  // TipTap editor setup
  const editor = useEditor({
    extensions: [StarterKit],
    content: generatedContent,
    editorProps: {
      attributes: {
        class: "min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setGeneratedContent(content);
      handleAutosave(content);
    },
  });

  useEffect(() => {
    if (editor && generatedContent) {
      editor.commands.setContent(generatedContent);
    }
  }, [editor, generatedContent]);

  // Handle dialog close
  const handleDialogClose = async (open: boolean) => {
    if (!open && editor?.getHTML()) {
      await handleSave(editor.getHTML());
    }
    setIsEditing(false);
    onOpenChange(open);
  };

  // Save content
  const handleSave = async (content: string) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          platform: 'twitter',
          status: 'draft'
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to save');
      
      setSavedPost(data.post);
      setGeneratedContent(content);
      toast.success('Changes saved');
      onSuccess?.(); // Call onSuccess after successful save
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Autosave with debounce
  let autosaveTimeout: NodeJS.Timeout;
  const handleAutosave = (content: string) => {
    clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(() => {
      if (content) {
        handleSave(content);
      }
    }, 1000);
  };

  const handleDoneEditing = async () => {
    if (editor) {
      const content = editor.getHTML();
      await handleSave(content);
      setIsEditing(false);
    }
  };

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
      if (editor) {
        editor.commands.setContent(data.content);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate post');
    } finally {
      setGeneratingPost(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
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

          {generatedContent && !isEditing ? (
            // View mode
            <div className="space-y-4">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleGenerate()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  Edit Post
                </Button>
              </div>
            </div>
          ) : isEditing ? (
            // Edit mode with TipTap
            <div className="space-y-4">
              <EditorContent editor={editor} />
              <div className="flex justify-end space-x-2">
                {isSaving && (
                  <span className="text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Saving...
                  </span>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleDoneEditing}
                >
                  Done Editing
                </Button>
              </div>
            </div>
          ) : (
            // Initial state
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
