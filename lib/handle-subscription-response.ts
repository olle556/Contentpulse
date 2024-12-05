import { toast } from "sonner";

export async function handleSubscriptionResponse(response: Response) {
  if (response.status === 403) {
    const data = await response.json();
    
    if (data.redirectUrl) {
      setTimeout(() => {
        window.location.href = data.redirectUrl;
      }, 2000);
    }
    
    toast.error("Please subscribe to access this feature.", {
      duration: 3500,
      position: "top-center",
    });
    
    return false;
  }
  return true;
}