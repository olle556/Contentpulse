// hooks/use-api.ts
import { useState } from 'react';
export function useProtectedApi() {
    const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
    const [alertType, setAlertType] = useState<'TRIAL_ENDED' | 'NO_SUBSCRIPTION'>('TRIAL_ENDED');
  
    const callApi = async (endpoint: string, options?: RequestInit) => {
      try {
        const response = await fetch(endpoint, options);
        
        if (response.status === 403) {
          const data = await response.json();
          setAlertType(data.type);
          setShowSubscriptionAlert(true);
          return null;
        }
        
        return response;
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    };
  
    return {
      callApi,
      showSubscriptionAlert,
      setShowSubscriptionAlert,
      alertType
    };
  }