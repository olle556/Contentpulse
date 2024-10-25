"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GeneratedPost } from "@/types";

interface EditPostDialogProps {
  post: GeneratedPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPostDialog({
  post,
  open,
  onOpenChange,
  onSuccess,
}: EditPostDialogProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (post) {
      setContent(post.content);
    }
  }, [post]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!post) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("generated_posts")
        .update({ content })
        .eq("id", post.id);

      if (error) throw error;

      toast.success("Post updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}