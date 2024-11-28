import { ContactForm } from "@/components/contact/contactForm";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContactPage() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full">Contact</h1>
      <p className="text-muted-foreground mt-2 text-center sm:text-left">
        Get in touch with us - we value your feedback and questions.
      </p>

      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="question">Question</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm defaultTab="feedback" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="question" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm defaultTab="question" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
