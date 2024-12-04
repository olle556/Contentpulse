'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface SubscriptionHandlerProps {
  children: React.ReactNode;
  response: Response;
}

export function SubscriptionHandler({ children, response }: SubscriptionHandlerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    if (response.status === 403) {
      response.json().then(data => {
        toast({
          title: "Subscription Required",
          description: "Please subscribe to access this feature.",
          variant: "destructive",
        });
        
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        }
        setIsAuthorized(false);
      });
    }
  }, [response, router, toast]);

  if (!isAuthorized) return null;
  return <>{children}</>;
}