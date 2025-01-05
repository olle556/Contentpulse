"use client";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Header } from "./header";
import { Footer } from "./footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Layers, Clock, Palette } from "lucide-react";
import { PricingSection } from "@/components/landing/pricing-section";
import ProcessFlow from "./process-flow";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogin = () => {
    toast.success("Redirecting to login...");
    router.push('/authentication/login');
  }

  const handleGetStarted = () => {
    toast.success("Redirecting to signup...");
    router.push('/authentication/signup?trial=true');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Header 
      onLogin={handleLogin}
      onGetStarted={handleGetStarted}
      isAuthenticated={!!session?.user}
      />
      <main className="flex-1 w-full max-w-7xl">
        <section className="w-full py-6 sm:py-12 md:py-24 lg:py-32">
          <div className="container flex flex-col items-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3 mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Automate Your Content Strategy
              </h1>
              <p className="max-w-[700px] text-gray-400 text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-left sm:mx-auto sm:text-center">
                Generate, schedule, and manage your content with powerful automation tools. Save time and boost your productivity.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:gap-4">
              <Button onClick={handleGetStarted} className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto text-base sm:text-lg md:text-xl h-12 sm:h-12 md:h-14">
              Automate My Content Now
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
              </Button>
            </div>
              <p className="text-sm text-gray-400">No credit card required - 7 days trial</p>
          </div>
        </section>
        <section className="w-full py-6 sm:py-12 md:py-24 lg:py-32" id="features">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                  Everything you need to scale
                </h2>
                <p className="mx-auto max-w-[900px] text-gray-400 text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Powerful features to help you manage, create, and schedule your content with ease.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 pt-12 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <FileText className="h-10 w-10 text-white" />
                  <CardTitle className="text-white">Content Generation</CardTitle>
                  <CardDescription className="text-gray-400">
                  Craft engaging, platform-specific posts in seconds with AI tailored to your brand identity                  </CardDescription>
                </CardHeader>
                <CardContent>
                 
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <Layers className="h-10 w-10 text-white" />
                  <CardTitle className="text-white">Content Sources</CardTitle>
                  <CardDescription className="text-gray-400">
                  Monitor and integrate content from your favorite sources                 </CardDescription>
                </CardHeader>
                <CardContent>
                  
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <Palette className="h-10 w-10 text-white" />
                  <CardTitle className="text-white">Brand Identity</CardTitle>
                  <CardDescription className="text-gray-400">
                    Integrate your unique brand identity into your content generation
                  </CardDescription>
                </CardHeader>
                <CardContent>

                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <Clock className="h-10 w-10 text-white" />
                  <CardTitle className="text-white">Smart Scheduling</CardTitle>
                  <CardDescription className="text-gray-400">
                  Schedule your content generation and receive your content to your mail                 </CardDescription>
                </CardHeader>
                <CardContent>
                 
                </CardContent>
              </Card>
            </div>
          </div>
        </section>


        <section id="about">
          <ProcessFlow />
        </section>

        <section id="pricing">
        <PricingSection onSubscribe={handleGetStarted} />
        </section>
        <section className="w-full  py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Start automating your content creation today
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Simplify content management so you can focus on growing your audience.


                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button onClick={handleGetStarted} className="bg-white text-black hover:bg-gray-200"> 
                Start saving time
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2 mt-2">
                <span>free 7 days trial</span>
                <span>•</span>
                <span>no credit card required</span>
                <span>•</span>
                <span>cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}