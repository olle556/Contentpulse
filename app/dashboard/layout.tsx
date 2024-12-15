import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { OnboardingTester } from "@/components/dev/onboarding-tester";
import { SubscriptionProvider } from '@/components/dashboard/subscription-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriptionProvider>
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="md:hidden">
          <MobileHeader />
        </div>
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="hidden md:block">
            <Header />
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
            {children}
            {process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SHOW_ONBOARDING_TESTER && <OnboardingTester />}
          </main>
        </div>
      </div>
    </SubscriptionProvider>
  );
}