"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    toast.success("Redirecting to login...");
    router.push('/authentication/login');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-3 duration-1000 mb-6">
            Content Pulse
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Generate engaging social media content powered by AI. Streamline your content creation workflow and maintain a consistent online presence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Target className="w-6 h-6" />}
            title="Smart Content Sourcing"
            description="Automatically gather relevant content from your specified sources using advanced web scraping."
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI-Powered Generation"
            description="Transform scraped content into platform-optimized posts using state-of-the-art AI."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Automated Publishing"
            description="Schedule and automate your posts across multiple social media platforms seamlessly."
          />
        </div>

        <div className="text-center">
          <Button size="lg" className="animate-bounce" onClick={handleGetStarted}>
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}
