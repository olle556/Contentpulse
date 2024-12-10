import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { PaymentForm } from "@/components/settings/payment-form";
import { SubscriptionSettings } from "@/components/settings/subscription-settings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// ändrade payment form till subscription settings. 

export default async function SettingsPage() {
  // Fetch user subscription data
  const session = await getServerSession(authOptions);
  const user = session?.user?.email ? await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      stripeCustomerId: true,
      subscriptionStatus: true,
      subscriptionEndDate: true,
      id: true
    }
  }) : null;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full">Settings</h1>
      <p className="text-muted-foreground mt-2 text-center sm:text-left">Customize your notification preferences and app settings</p>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="subscription">Account & Subscription</TabsTrigger>
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

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account & Subscription Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionSettings 
                stripeCustomerId={user?.stripeCustomerId}
                subscriptionStatus={user?.subscriptionStatus}
                subscriptionEndDate={user?.subscriptionEndDate}
                userId={user?.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
