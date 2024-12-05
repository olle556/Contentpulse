import { toast } from "sonner";

export async function handleSubscriptionResponse(response: Response) {
  if (response.status === 403) {
    const data = await response.json();
    
    toast.error("Please subscribe to access this feature.");
    
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
    return false;
  }
  return true;
}