"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";

export function OnboardingTester() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;

  const checkProgress = async () => {
    setIsLoading('check');
    try {
      const response = await fetch('/api/onboarding/progress');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to check progress');
      
      console.log('Onboarding Progress:', data);
      toast.success('Progress checked! Check console for details.');
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
      await checkProgress(); // Check progress after reset
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
      let endpoint = '';
      let data = {};
      
      switch (step) {
        case 'brand':
          endpoint = '/api/brands';
          data = { name: 'Test Brand', description: 'Test Description' };
          break;
        case 'sources':
          endpoint = '/api/sources';
          data = { url: 'https://example.com', name: 'Test Source' };
          break;
        default:
          throw new Error('Unknown step');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to simulate ${step}`);
      }

      toast.success(`Simulated ${step} completion`);
      await checkProgress(); // Check progress after simulation
    } catch (error) {
      console.error(`Error simulating ${step}:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to simulate ${step}`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardHeader>
        <CardTitle className="text-sm">Onboarding Tester (Dev Only)</CardTitle>
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
          <Button 
            onClick={() => simulateCompletion('brand')} 
            variant="outline" 
            size="sm"
            disabled={!!isLoading}
          >
            {isLoading === 'brand' ? 'Adding...' : 'Add Brand'}
          </Button>
          <Button 
            onClick={() => simulateCompletion('sources')} 
            variant="outline" 
            size="sm"
            disabled={!!isLoading}
          >
            {isLoading === 'sources' ? 'Adding...' : 'Add Source'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
