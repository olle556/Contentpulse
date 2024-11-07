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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sources.map((source) => (
          <div 
            key={source.id} 
            className="p-4 border rounded-lg overflow-hidden flex flex-col justify-between space-y-2 hover:shadow-sm transition-shadow duration-200"
          >
            <div className="flex items-center justify-between space-x-2">
              <div 
                className="font-medium break-words overflow-hidden text-ellipsis flex-1 min-w-0 text-sm sm:text-base"
                title={source.url}
              >
                {source.url}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSourceToDelete(source)}
                className="flex-shrink-0"
              >
                <Trash2Icon className="w-3 h-3 sm:w-4 sm:h-4" />
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
