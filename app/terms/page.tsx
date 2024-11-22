import { TermsOfService } from "@/components/legal/terms-of-service";
import { BackButton } from "@/components/legal/back-button";

export default function TermsPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <BackButton />
      <TermsOfService />
    </div>
  );
}