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
import { Loader2, Check, RefreshCw, Save } from "lucide-react";
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
import { fetchWithRetry } from "@/utils/fetch-with-retry";

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
  const [useEmojis, setUseEmojis] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
      setHasUnsavedChanges(true); // Mark that there are unsaved changes
    },
  });

  useEffect(() => {
    if (editor && generatedContent) {
      editor.commands.setContent(generatedContent);
    }
  }, [editor, generatedContent]);

  // Add this cleanup function
  const resetDialog = () => {
    setGeneratedContent("");
    setScrapedContent(null);
    setSavedPostId(null);
    setSelectedSources([]);
    setIsEditing(false);
    setIsSaving(false);
    setSavedPost(null);
    setAiInstructions("");
    setUseEmojis(false);
    setIsRegenerating(false);
    // Reset editor content if it exists
    if (editor) {
      editor.commands.setContent("");
    }
  };

  // Modify the handleDialogClose function
  const handleDialogClose = async (open: boolean) => {
    console.log('Dialog close triggered', { open, hasUnsavedChanges });
    
    if (!open && hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirm) {
        return;
      }
    }
    
    if (!open) {
      console.log('Resetting dialog');
      resetDialog();
    }
    onOpenChange(open);
  };

  // Add an effect to reset when dialog opens
  useEffect(() => {
    if (open) {
      resetDialog();
    }
  }, [open]);

  // Function for saving during editing
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

  // Function for quick-saving generated content
  const handleSavePost = async (event?: React.MouseEvent) => {
    event?.preventDefault(); // Prevent any default actions
    console.log('Save post started');
    setIsSaving(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedContent,
          platform: selectedPlatform,
          status: 'draft'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      const data = await response.json();
      setSavedPostId(data.post.id);
      setHasUnsavedChanges(false);
      toast.success('Post saved successfully');
      onSuccess?.(); // Refresh the posts list if needed
      console.log('Save post completed successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save post');
    } finally {
      setIsSaving(false);
      console.log('Save post finished');
    }
  };

  // Function for completing the editing process
  const handleDoneEditing = async () => {
    if (editor) {
      const content = editor.getText();
      try {
        await handleSave(content);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        onSuccess?.();
        onOpenChange(false); // Only close dialog here
      } catch (error) {
        toast.error('Failed to save changes');
      }
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    try {
      const response = await fetchWithRetry('/api/sources');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sources');
      }
      
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

  async function handleGenerate(event: React.MouseEvent<HTMLButtonElement> | boolean = false) {
    const isRegeneration = typeof event === 'boolean' ? event : false;
    
    if (!isRegeneration) {
      setGeneratingPost(true);
      setIsScraping(true);
    } else {
      setIsRegenerating(true);
    }

    try {
      const selectedSource = sources.find(source => source.id === selectedSources[0]);
      if (!selectedSource) {
        throw new Error("Selected source not found");
      }

      const endpoint = isRegeneration ? '/api/generate-post/regenerate' : '/api/generate-post';
      
      console.log('Current scrapedContent:', scrapedContent);
      
      const requestBody = {
        sourceUrl: selectedSource.url,
        platform: selectedPlatform,
        tone: selectedTone,
        useEmojis,
        aiInstructions,
        ...(scrapedContent && { scrapedContent })
      };

      console.log('Sending request to:', endpoint, requestBody);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      if (!isRegeneration) {
        console.log('Setting scraped content from response:', data.scrapedContent);
        setScrapedContent(data.scrapedContent);
      }
      
      setGeneratedContent(data.content);
      setSavedPostId(data.post?.id);
      
      if (editor) {
        editor.commands.setContent(data.content);
      }
      
      toast.success(isRegeneration ? 'Post regenerated successfully' : 'Post generated successfully');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate post');
    } finally {
      setGeneratingPost(false);
      setIsScraping(false);
      setIsRegenerating(false);
    }
  }

  // Add a function to handle canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (editor) {
      editor.commands.setContent(generatedContent);
    }
  };

  // Update the editor's onUpdate handler to track changes
  useEffect(() => {
    if (editor) {
      editor.on('update', ({ editor }) => {
        const content = editor.getText();
        setGeneratedContent(content);
        setHasUnsavedChanges(true);
      });
    }
  }, [editor]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleDialogClose}
    >
      <DialogContent 
        className="sm:max-w-[600px]"
        onInteractOutside={(e) => {
          console.log('Interaction outside dialog');
          e.preventDefault(); // Prevent closing on outside click
        }}
        onEscapeKeyDown={(e) => {
          console.log('Escape key pressed');
          e.preventDefault(); // Prevent closing on escape
        }}
      >
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="useEmojis"
              checked={useEmojis}
              onCheckedChange={(checked) => setUseEmojis(checked as boolean)}
            />
            <Label htmlFor="useEmojis">Include emojis in the post</Label>
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

          {!generatedContent && (
            <Button
              onClick={() => handleGenerate(false)}
              disabled={generatingPost || selectedSources.length === 0}
              className="w-full"
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

          {generatedContent && !isEditing ? (
            <div className="space-y-4">
              <div className="prose max-w-none whitespace-pre-wrap max-h-[400px] overflow-y-auto border rounded-md p-4">
                {generatedContent}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleGenerate(true)}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => handleSavePost(e)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Post
                    </>
                  )}
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  Edit Post
                </Button>
              </div>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div className="max-h-[400px] overflow-y-auto">
                <EditorContent editor={editor} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
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
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
