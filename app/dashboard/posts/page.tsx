"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { GeneratePostDialog } from "@/components/posts/generate-post-dialog";
import { PostList } from "@/components/posts/post-list";
import { GeneratedPost } from "@/types";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function PostsPage() {
  const { markStepCompleted } = useOnboarding();
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [key, setKey] = useState(0);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const shortText = "View and manage your AI-generated social media posts.";
  const fullText = "View and manage your AI-generated social media posts. Click 'Generate New Post' to create engaging content tailored to your brand.";

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
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-left">Generated Posts</h1>
        <Button 
          onClick={() => setIsGenerateOpen(true)} 
          className="w-full md:w-auto"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Generate New Post
        </Button>
      </div>

      <div className="text-muted-foreground text-left">
        {/* Desktop version */}
        <p className="hidden md:block">
          {fullText}
        </p>

        {/* Mobile version */}
        <div className="md:hidden">
          <p>{isTextExpanded ? fullText : shortText}</p>
          <Button 
            variant="ghost" 
            className="mt-2 h-8 px-2 text-xs"
            onClick={() => setIsTextExpanded(!isTextExpanded)}
          >
            {isTextExpanded ? (
              <div className="flex items-center">
                Show Less <ChevronUp className="ml-1 h-4 w-4" />
              </div>
            ) : (
              <div className="flex items-center">
                Show More <ChevronDown className="ml-1 h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
      </div>

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
