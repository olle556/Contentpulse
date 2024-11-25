'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      const response = await fetch('/api/check-subscription');
      const { hasActiveSubscription } = await response.json();
      setHasSubscription(hasActiveSubscription);
    };

    checkSubscription();
  }, []);

  if (hasSubscription === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Subscription Required</h2>
        <p className="mb-4">Please subscribe to access this feature.</p>
        <Button onClick={() => router.push('/dashboard/settings')}>
          View Plans
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}