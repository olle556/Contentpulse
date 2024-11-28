"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { GeneratePostDialog } from "@/components/posts/generate-post-dialog";
import { PostList } from "@/components/posts/post-list";
import { GeneratedPost } from "@/types";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function PostsPage() {
  const { markStepCompleted } = useOnboarding();
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [key, setKey] = useState(0);

  const { data: posts = [], refetch: refreshPosts } = useQuery<GeneratedPost[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      const data = await response.json();
      if (data.success) {
        return data.posts;
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const handleRefresh = async () => {
    await refreshPosts();
  };

  const handleSuccess = async () => {
    console.log('Success callback triggered');
    await handleRefresh();
    await markStepCompleted('posts');
    setKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
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
      <p className="text-muted-foreground mt-2 text-center sm:text-left">
            View and manage your AI-generated social media posts. Click &apos;Generate New Post&apos; to create engaging content tailored to your brand.
          </p>

      <PostList 
        key={key} 
        posts={posts} 
        onRefresh={handleRefresh}
      />
      <GeneratePostDialog 
        open={isGenerateOpen} 
        onOpenChange={setIsGenerateOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
