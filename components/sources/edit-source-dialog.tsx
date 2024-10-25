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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ContentSource } from "@/types";

interface EditSourceDialogProps {
  source: ContentSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditSourceDialog({
  source,
  open,
  onOpenChange,
  onSuccess,
}: EditSourceDialogProps) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (source) {
      setUrl(source.url);
      setCategory(source.category);
      setFrequency(source.crawlFrequency);
    }
  }, [source]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!source) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("content_sources")
        .update({
          url,
          category,
          crawl_frequency: frequency,
        })
        .eq("id", source.id);

      if (error) throw error;

      toast.success("Content source updated successfully");
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
          <DialogTitle>Edit Content Source</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Crawl Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
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