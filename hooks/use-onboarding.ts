import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useOnboarding() {
  const queryClient = useQueryClient();

  const { data: completedSteps, isLoading } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: async () => {

      const response = await fetch('/api/onboarding/progress');
      const data = await response.json();

      
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

      
      queryClient.setQueryData(['onboarding-progress'], (old: string[] = []) => {

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