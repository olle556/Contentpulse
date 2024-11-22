import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useOnboarding() {
  const queryClient = useQueryClient();

  const { data: completedSteps, isLoading } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: async () => {
      console.log('useOnboarding - Fetching progress');
      const response = await fetch('/api/onboarding/progress');
      const data = await response.json();
      console.log('useOnboarding - Received progress data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch progress');
      }
      
      return data.completedSteps || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const markStepCompleted = async (stepId: string) => {
    try {
      console.log('useOnboarding - Marking step as completed:', stepId);
      
      queryClient.setQueryData(['onboarding-progress'], (old: string[] = []) => {
        console.log('useOnboarding - Current progress:', old);
        if (!old.includes(stepId)) {
          return [...old, stepId];
        }
        return old;
      });

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId }),
      });

      const data = await response.json();
      console.log('useOnboarding - Step completion response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark step as completed');
      }

      await queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
      
      return data;
    } catch (error) {
      console.error('useOnboarding - Error marking step as completed:', error);
      await queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
      throw error;
    }
  };

  return {
    completedSteps,
    isLoading,
    markStepCompleted,
  };
}