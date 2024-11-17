"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";

export function OnboardingTester() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { completedSteps, markStepCompleted } = useOnboarding();

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;

  const checkProgress = async () => {
    setIsLoading('check');
    try {
      const response = await fetch('/api/onboarding/progress');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to check progress');
      
      toast.success(`Completed steps: ${data.completedSteps.join(', ') || 'none'}`);
    } catch (error) {
      console.error('Error checking progress:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to check progress');
    } finally {
      setIsLoading(null);
    }
  };

  const resetProgress = async () => {
    setIsLoading('reset');
    try {
      const response = await fetch('/api/onboarding/reset', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to reset progress');
      
      toast.success('Progress reset successfully');
      await checkProgress();
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reset progress');
    } finally {
      setIsLoading(null);
    }
  };

  const simulateCompletion = async (step: string) => {
    setIsLoading(step);
    try {
      await markStepCompleted(step);
      toast.success(`Marked ${step} as completed`);
    } catch (error) {
      console.error(`Error marking ${step} as completed:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to mark ${step} as completed`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardHeader>
        <CardTitle className="text-sm">
          Onboarding Tester (Dev Only)
          {completedSteps && (
            <span className="text-xs text-muted-foreground ml-2">
              {completedSteps.length}/4 completed
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          onClick={checkProgress} 
          variant="outline" 
          size="sm"
          className="w-full"
          disabled={!!isLoading}
        >
          {isLoading === 'check' ? 'Checking...' : 'Check Progress'}
        </Button>
        <Button 
          onClick={resetProgress} 
          variant="destructive" 
          size="sm"
          className="w-full"
          disabled={!!isLoading}
        >
          {isLoading === 'reset' ? 'Resetting...' : 'Reset Progress'}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          {['brand', 'sources', 'posts', 'schedule'].map((step) => (
            <Button 
              key={step}
              onClick={() => simulateCompletion(step)} 
              variant={completedSteps?.includes(step) ? 'success' : 'outline'}
              size="sm"
              disabled={!!isLoading}
            >
              {isLoading === step ? 'Adding...' : `Add ${step}`}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
