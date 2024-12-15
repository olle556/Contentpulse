import { Button } from "../ui/button";
import { Share } from "lucide-react";

interface ShareButtonProps {
    platform: string;
    content: string;
}

export function ShareButton({ platform, content }: ShareButtonProps) {
    const getShareUrl = (platform: string, content: string) => {
        switch (platform.toLowerCase()) {
            case 'twitter':
            case 'x':
            case 'x premium':
                return `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
            case 'threads':
                return `https://threads.net/intent/post?text=${encodeURIComponent(content)}`;
            case 'linkedin':
                return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent('')}&text=${encodeURIComponent(content)}`;
            case 'facebook':
                return `https://www.facebook.com/dialog/share?href=${encodeURIComponent('')}&quote=${encodeURIComponent(content)}`;
            case 'bluesky':
                return `https://bsky.app/intent/compose?text=${encodeURIComponent(content)}`;
            default:
                return '#';
        }
    };

    const handleShare = () => {
        const shareUrl = getShareUrl(platform, content);
        if (shareUrl !== '#') {
            window.open(shareUrl, '_blank');
        }
    };

    return (
        <Button
            size="sm"
            variant="default"
            onClick={handleShare}
            className="relative min-w-[70px] transition-all duration-200"
        >
            <Share className="h-4 w-4 mr-2" />
            Share
        </Button>
    );
} 