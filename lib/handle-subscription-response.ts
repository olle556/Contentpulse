import { toast } from "sonner";

export async function handleSubscriptionResponse(response: Response) {
  if (response.status === 403) {
    await response.json();
    return false;
  }
  return true;
}