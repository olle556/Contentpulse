'use client';

import { Button } from "../ui/button";
import { Copy, Share } from "lucide-react";
import { toast } from "sonner";

interface SocialShareButtonProps {
  platform: string;
  content: string;
}

export function SocialShareButton({ platform, content }: SocialShareButtonProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard!");
  };

  const handleShare = () => {
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        const encodedText = encodeURIComponent(content);
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
        break;
      // Add other platforms here when implementing
      default:
        toast.error("Sharing for this platform is not yet implemented");
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleShare}
      >
        <Share className="h-4 w-4 mr-2" />
        Share on {platform}
      </Button>
    </div>
  );
}