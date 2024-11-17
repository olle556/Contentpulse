"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2, Target, Settings, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { OnboardingStep } from "@/types";
import { useOnboarding } from "@/hooks/use-onboarding";

export function WelcomeCard() {
  const { completedSteps, isLoading } = useOnboarding();

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'brand',
      title: "Set up your brand",
      description: "Configure your brand voice, tone, and preferences to generate more relevant content.",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/brand",
      isCompleted: false
    },
    {
      id: 'sources',
      title: "Add content sources",
      description: "Connect your favorite websites and RSS feeds to source content ideas.",
      icon: <Target className="h-5 w-5" />,
      href: "/dashboard/sources",
      isCompleted: false
    },
    {
      id: 'posts',
      title: "Generate your first post",
      description: "Use AI to create engaging social media content from your sources.",
      icon: <Wand2 className="h-5 w-5" />,
      href: "/dashboard/posts",
      isCompleted: false
    },
    {
      id: 'schedule',
      title: "Schedule content generation",
      description: "Set up automated content generation to maintain a consistent posting schedule.",
      icon: <Calendar className="h-5 w-5" />,
      href: "/dashboard/schedule",
      isCompleted: false
    }
  ]);

  useEffect(() => {
    if (completedSteps) {
      setSteps(prevSteps => 
        prevSteps.map(step => ({
          ...step,
          isCompleted: completedSteps.includes(step.id)
        }))
      );
    }
  }, [completedSteps]);

  // Return null if all steps are completed
  if (completedSteps?.length === steps.length) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl animate-pulse bg-muted h-6 w-48 rounded" />
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="animate-pulse bg-muted h-4 w-3/4 rounded" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="animate-pulse bg-muted h-8 w-8 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="animate-pulse bg-muted h-4 w-1/2 rounded" />
                  <div className="animate-pulse bg-muted h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome to Content Pulse! 👋</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Follow these four simple steps to start automating your social media content creation.
        </p>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                step.isCompleted 
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-background'
              }`}>
                {step.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  step.icon
                )}
              </div>
              <div className={`space-y-1.5 ${
                step.isCompleted ? 'relative' : ''
              }`}>
                <h3 className="font-medium leading-none flex items-center gap-2">
                  {index + 1}. {step.title}
                  {step.isCompleted && (
                    <span className="text-xs text-green-500 font-medium">
                      Completed
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                <Link href={step.href}>
                  <Button 
                    variant="link" 
                    className={`p-0 h-auto font-normal ${
                      step.isCompleted ? 'text-green-600 hover:text-green-700' : ''
                    }`}
                  >
                    {step.isCompleted ? 'View' : 'Get started'} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}