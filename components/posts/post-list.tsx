"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { GeneratedPost } from "@/types";
import { format } from "date-fns";
import { DeletePostDialog } from "./delete-post-dialog";
import { EditPostDialog } from "./edit-post-dialog";
import { GeneratePostDialog } from "./generate-post-dialog";
import { toast } from "react-toastify";


export function PostList() {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [copyingStates, setCopyingStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchPosts();
  }, [isGenerateOpen]);

  async function fetchPosts() {
    try {
      setLoading(true);
      const response = await fetch('/api/posts');
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        console.log('Setting posts:', data.posts);
        setPosts(data.posts);
      } else {
        console.error('Failed to fetch posts:', data.error);
        toast.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(post: GeneratedPost) {
    setSelectedPost(post);
    setIsEditOpen(true);
  }

  function handleDelete(post: GeneratedPost) {
    setSelectedPost(post);
    setIsDeleteOpen(true);
  }

  const copyToClipboard = async (text: string, postId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyingStates(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setCopyingStates(prev => ({ ...prev, [postId]: false }));
      }, 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No posts generated yet. Click &quot;Generate New Post&quot; to get started.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="flex flex-col h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-shrink-0">
              <div className="space-y-1">
               
                <p className="text-sm text-muted-foreground">
                  {format(new Date(post.createdAt), "PPP")}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(post)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(post)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-grow">
              <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                {post.content}
              </div>
            </CardContent>
            <div className="p-4 border-t flex items-center justify-between flex-shrink-0">
              <div className="flex gap-2">
                <Badge variant="outline">{post.platform}</Badge>
              </div>
              <Button 
                size="sm" 
                variant="default" 
                onClick={() => copyToClipboard(post.content, post.id)}
                className="relative min-w-[70px] transition-all duration-200"
                disabled={copyingStates[post.id]}
              >
                <span className={`${copyingStates[post.id] ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
                  Copy
                </span>
                <span 
                  className={`absolute left-1/2 -translate-x-1/2 
                    ${copyingStates[post.id] ? 'opacity-100' : 'opacity-0'} 
                    transition-opacity duration-200`}
                >
                  Copied!
                </span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <DeletePostDialog
        post={selectedPost}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={() => {
          fetchPosts();
          setSelectedPost(null);
        }}
      />

      <EditPostDialog
        post={selectedPost}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={fetchPosts}
      />

      <GeneratePostDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        onSuccess={() => {
          fetchPosts();
        }}
      />
      

    </>
  );
}

function getStatusVariant(status: string): "default" | "destructive" | "outline" | "secondary" {
  switch (status) {
    case "approved":
      return "secondary";
    case "rejected":
      return "destructive";
    case "pending":
      return "default";
    default:
      return "outline";
  }
}
