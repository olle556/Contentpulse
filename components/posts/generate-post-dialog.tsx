"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GeneratePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeneratePostDialog({
  open,
  onOpenChange,
}: GeneratePostDialogProps) {
  const [platform, setPlatform] = useState<"X" | "Threads">("X");
  const [contentType, setContentType] = useState<"text" | "thread">("text");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const supabase = createClientComponentClient();

  async function handleGenerate() {
    setLoading(true);

    try {
      // Here you would integrate with your AI service to generate content
      // For now, we'll simulate the generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const content = `Sample generated ${contentType} for ${platform} with a ${tone} tone.`;
      setGeneratedContent(content);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!generatedContent) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_posts").insert({
        user_id: session.user.id,
        content: generatedContent,
        platform,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Post saved successfully");
      onOpenChange(false);
      setGeneratedContent("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate New Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(value: "X" | "Threads") => setPlatform(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="X">X (Twitter)</SelectItem>
                <SelectItem value="Threads">Threads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={contentType} onValueChange={(value: "text" | "thread") => setContentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Single Post</SelectItem>
                <SelectItem value="thread">Thread</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {generatedContent && (
            <div className="space-y-2">
              <Label>Generated Content</Label>
              <Textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={5}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {!generatedContent ? (
              <Button onClick={handleGenerate} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Post
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}