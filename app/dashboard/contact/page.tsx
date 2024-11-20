import { ContactForm } from "@/components/contact/contactForm";
import { Separator } from "@/components/ui/separator";

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Contact</h3>
        <p className="text-sm text-muted-foreground">
          Get in touch with us - we value your feedback and questions.
        </p>
      </div>
      <Separator />
      <ContactForm />
    </div>
  );
}
