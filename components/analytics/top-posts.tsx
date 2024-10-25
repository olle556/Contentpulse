"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopPosts() {
  const posts = [
    {
      id: 1,
      title: "10 Tips for Better Programming",
      platform: "Twitter",
      engagement: "4.5k",
      image: "/path-to-image.jpg",
    },
    // Add more posts
  ];

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={post.image} alt={post.title} />
            <AvatarFallback>TP</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{post.title}</p>
            <p className="text-sm text-muted-foreground">
              {post.platform} • {post.engagement} engagements
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}