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
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedPlatform, setSelectedPlatform] = useState("twitter");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [isScraping, setIsScraping] = useState(false);
  const [aiInstructions, setAiInstructions] = useState("");
  const [savedPostId, setSavedPostId] = useState<string | null>(null);

  const TONES = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "funny", label: "Funny" },
    { value: "creative", label: "Creative" },
    { value: "formal", label: "Formal" },
  ];

  const PLATFORMS = [
    { 
      value: "twitter", 
      label: "Twitter/X",
      maxLength: 280,
    },
    { 
      value: "threads", 
      label: "Threads",
      maxLength: 500,
    },
    { 
      value: "linkedin", 
      label: "LinkedIn",
      maxLength: 3000,
    },
    { 
      value: "facebook", 
      label: "Facebook",
      maxLength: 63206,
    },
  ];

  // TipTap editor setup
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      // Remove StarterKit and only include specific extensions you need
    ],
    content: generatedContent,
    editorProps: {
      attributes: {
        class: "min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getText(); // Use getText() instead of getHTML()
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
    if (!open && editor?.getText() && isEditing) {
      try {
        await handleSave(editor.getText());
      } catch (error) {
        // Handle error if needed
      }
    }
    setIsEditing(false);
    onOpenChange(open);
  };

  // Save content
  const handleSave = async (content: string) => {
    setIsSaving(true);
    try {
      const method = savedPostId ? 'PATCH' : 'POST';
      const url = savedPostId ? `/api/posts/${savedPostId}` : '/api/posts';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content.trim(),
          platform: selectedPlatform,
          status: 'draft'
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save');
      
      setSavedPost(data.post);
      setSavedPostId(data.post.id);
      setGeneratedContent(content);
      toast.success('Changes saved');
      onSuccess?.();
    } catch (error) {
      console.error('Save error:', error);
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
      const content = editor.getText();
      try {
        await handleSave(content);
        setIsEditing(false);
        onSuccess?.();
        onOpenChange(false);
      } catch (error) {
        toast.error('Failed to save changes');
      }
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    try { //API/sources
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
      toast.error("Please select a source");
      return;
    }

    setGeneratingPost(true);
    setIsScraping(true);

    try {
      const selectedSource = sources.find(source => source.id === selectedSources[0]);
      if (!selectedSource) {
        throw new Error("Selected source not found");
      }

      console.log('Selected source URL:', selectedSource.url); // Debug log

      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceUrl: selectedSource.url,
          platform: selectedPlatform,
          tone: selectedTone,
          instructions: aiInstructions,
        }),
      });

      const data = await response.json();
      
      if (response.status === 402) {
        toast.error("Service is temporarily unavailable. Please try again later.");
        return;
      }
      
      if (!response.ok) throw new Error(data.error || 'Failed to generate post');

      setGeneratedContent(data.content);
      setSavedPostId(data.post.id);
      if (editor) {
        editor.commands.setContent(data.content);
      }
      toast.success('Post generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate post');
    } finally {
      setGeneratingPost(false);
      setIsScraping(false);
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
            <Label>Select Source</Label>
            <Select
              value={selectedSources[0] || ""}
              onValueChange={(sourceId) => setSelectedSources([sourceId])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem 
                    key={source.id} 
                    value={source.id}
                    className="flex flex-col items-start py-2"
                  >
                    <div className="max-w-[500px] break-all">
                      {source.url}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {source.category}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>AI Instructions (Optional)</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Add specific instructions for how the AI should generate this post..."
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select
                value={selectedTone}
                onValueChange={setSelectedTone}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={selectedPlatform}
                onValueChange={setSelectedPlatform}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEditing && (
            <div className="text-sm text-muted-foreground text-right">
              {generatedContent.length} / {
                PLATFORMS.find(p => p.value === selectedPlatform)?.maxLength || '∞'
              } characters
            </div>
          )}

          {generatedContent && !isEditing ? (
            // View mode - update to use plain text
            <div className="space-y-4">
              <div className="prose max-w-none whitespace-pre-wrap">
                {generatedContent}
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
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Done Editing'
                  )}
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
                  {isScraping ? 'Scraping content...' : 'Generating post...'}
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
