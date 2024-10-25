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
import { ContentSource } from "@/types";

interface DeleteSourceDialogProps {
  source: ContentSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteSourceDialog({
  source,
  open,
  onOpenChange,
  onSuccess,
}: DeleteSourceDialogProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  async function handleDelete() {
    if (!source) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("content_sources")
        .delete()
        .eq("id", source.id);

      if (error) throw error;

      toast.success("Content source deleted successfully");
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
          <AlertDialogTitle>Delete Content Source</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this content source? This action cannot
            be undone.
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