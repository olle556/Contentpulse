import { CookiePolicy } from "@/components/legal/cookie-policy";
import { BackButton } from "@/components/legal/back-button";

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <BackButton />
      <CookiePolicy />
    </div>
  );
}
