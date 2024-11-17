import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useOnboarding() {
  const queryClient = useQueryClient();

  const { data: completedSteps, isLoading } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: async () => {
      const response = await fetch('/api/onboarding/progress');
      const data = await response.json();
      return data.completedSteps || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const markStepCompleted = async (stepId: string) => {
    try {
      // Optimistically update the cache
      queryClient.setQueryData(['onboarding-progress'], (old: string[] = []) => {
        if (!old.includes(stepId)) {
          return [...old, stepId];
        }
        return old;
      });

      // Make the API call
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark step as completed');
      }

      // Force a refetch to ensure all components have the latest data
      await queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
      console.error('Failed to mark step as completed:', error);
    }
  };

  return {
    completedSteps,
    isLoading,
    markStepCompleted,
  };
}