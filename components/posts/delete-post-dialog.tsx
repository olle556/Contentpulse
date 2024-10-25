"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { GeneratedPost } from "@/types";

interface DeletePostDialogProps {
  post: GeneratedPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeletePostDialog({
  post,
  open,
  onOpenChange,
  onSuccess,
}: DeletePostDialogProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  async function handleDelete() {
    if (!post) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("generated_posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      toast.success("Post deleted successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}