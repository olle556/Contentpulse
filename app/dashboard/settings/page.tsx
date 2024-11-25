import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { PaymentForm } from "@/components/settings/payment-form";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  // Fetch user subscription data
  const session = await getServerSession();
  const user = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      stripeCustomerId: true,
      subscriptionStatus: true
    }
  }) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Customize your notification preferences and app settings</p>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentForm 
                stripeCustomerId={user?.stripeCustomerId}
                subscriptionStatus={user?.subscriptionStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
