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

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No posts generated yet. Click "Generate New Post" to get started.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <Badge variant={getStatusVariant(post.status)}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </Badge>
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
            <CardContent>
              <div 
                className="prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <div className="mt-2">
                <Badge variant="outline">{post.platform}</Badge>
              </div>
            </CardContent>
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
