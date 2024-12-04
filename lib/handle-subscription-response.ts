import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Struntar i denna. GAMMAL!!!

// NOT USING THIS ANYMORE

export async function handleSubscriptionResponse(response: Response) {
  if (response.status === 403) {
    const router = useRouter();
    const { toast } = useToast();
    const data = await response.json();
    
    toast({
      title: "Subscription Required",
      description: "Please subscribe to access this feature.",
      variant: "destructive",
    });
    
    if (data.redirectUrl) {
      router.push(data.redirectUrl);
    }
    return false;
  }
  return true;
}