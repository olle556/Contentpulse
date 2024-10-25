"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { GeneratePostDialog } from "@/components/posts/generate-post-dialog";
import { PostList } from "@/components/posts/post-list";

export default function PostsPage() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Generated Posts</h1>
        <Button onClick={() => setIsGenerateOpen(true)}>
          <Wand2 className="h-4 w-4 mr-2" />
          Generate New Post
        </Button>
      </div>

      <PostList />
      <GeneratePostDialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen} />
    </div>
  );
}