"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { GeneratePostDialog } from "@/components/posts/generate-post-dialog";
import { PostList } from "@/components/posts/post-list";

export default function PostsPage() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [key, setKey] = useState(0); // Add this to force refresh

  const handleGenerateSuccess = useCallback(() => {
    setIsGenerateOpen(false);
    setKey(prev => prev + 1); // Force PostList to remount and refetch
  }, []);

  return (
    <div className="space-y-6 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full">Generated Posts</h1>
        <Button 
          onClick={() => setIsGenerateOpen(true)} 
          className="w-full sm:w-auto"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Generate New Post
        </Button>
      </div>

      <PostList key={key} />
      <GeneratePostDialog 
        open={isGenerateOpen} 
        onOpenChange={setIsGenerateOpen}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}
