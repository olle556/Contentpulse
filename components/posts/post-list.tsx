"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { GeneratedPost } from "@/types";
import { format } from "date-fns";
import { EditPostDialog } from "./edit-post-dialog";
import { DeletePostDialog } from "./delete-post-dialog";
import { toast } from "sonner";

export function PostList() {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [editingPost, setEditingPost] = useState<GeneratedPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<GeneratedPost | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("generated_posts")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data as GeneratedPost[]);
    }
  }

  async function handleStatusChange(post: GeneratedPost, newStatus: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from("generated_posts")
        .update({ status: newStatus })
        .eq("id", post.id);

      if (error) throw error;

      toast.success(`Post ${newStatus} successfully`);
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
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
                onClick={() => setEditingPost(post)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingPost(post)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{post.content}</p>
            <div className="mt-2">
              <Badge variant="outline">{post.platform}</Badge>
            </div>
          </CardContent>
          {post.status === "pending" && (
            <CardFooter className="justify-end space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleStatusChange(post, "rejected")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange(post, "approved")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}

      <EditPostDialog
        post={editingPost}
        open={!!editingPost}
        onOpenChange={(open) => !open && setEditingPost(null)}
        onSuccess={fetchPosts}
      />

      <DeletePostDialog
        post={deletingPost}
        open={!!deletingPost}
        onOpenChange={(open) => !open && setDeletingPost(null)}
        onSuccess={fetchPosts}
      />
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    case "posted":
      return "default";
    default:
      return "secondary";
  }
}