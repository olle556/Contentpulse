"use client";

import { ContentSource } from "@/types";
import { Button } from "../ui/button";
import { Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState, useEffect } from "react";

interface ContentSourceListProps {
  sources: ContentSource[];
  onSourceDeleted?: () => void;
}

export function ContentSourceList({ sources: initialSources, onSourceDeleted }: ContentSourceListProps) {
  const [sourceToDelete, setSourceToDelete] = useState<ContentSource | null>(null);
  const [sources, setSources] = useState<ContentSource[]>(initialSources);

  const handleDelete = async () => {
    if (!sourceToDelete) return;
    
    try {
      const response = await fetch(`/api/sources/${sourceToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSources(sources.filter(source => source.id !== sourceToDelete.id));
        onSourceDeleted?.();
      }
    } catch (error) {
      console.error('Error deleting source:', error);
    }
    
    setSourceToDelete(null);
  };

  useEffect(() => {
    setSources(initialSources);
  }, [initialSources]);

  if (sources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sources added yet. Add your first source to get started.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {sources.map((source) => (
          <div key={source.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="font-medium">{source.url}</div>
              <Button 
                variant="outline" 
                onClick={() => setSourceToDelete(source)}
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!sourceToDelete} onOpenChange={() => setSourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this source. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
