// components/dashboard/subscription-context.tsx
'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { SubscriptionAlert } from './subscription-alert';

type SubscriptionContextType = {
  showSubscriptionAlert: boolean;
  setShowSubscriptionAlert: (show: boolean) => void;
  alertType: 'TRIAL_ENDED' | 'NO_SUBSCRIPTION';
  setAlertType: (type: 'TRIAL_ENDED' | 'NO_SUBSCRIPTION') => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
  const [alertType, setAlertType] = useState<'TRIAL_ENDED' | 'NO_SUBSCRIPTION'>('TRIAL_ENDED');

  return (
    <SubscriptionContext.Provider 
      value={{ 
        showSubscriptionAlert, 
        setShowSubscriptionAlert,
        alertType,
        setAlertType
      }}
    >
      {children}
      <SubscriptionAlert 
        isOpen={showSubscriptionAlert} 
        onClose={() => setShowSubscriptionAlert(false)}
        type={alertType}
      />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}