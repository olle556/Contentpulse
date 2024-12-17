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
import { FileText, Layers, Clock } from "lucide-react";
import { PricingSection } from "@/components/landing/pricing-section";
import ProcessFlow from "./process-flow";

export default function LandingPage() {
  const router = useRouter();

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
      <Header onLogin={handleLogin} onGetStarted={handleGetStarted} />
      <main className="flex-1 w-full max-w-7xl">
        <section className="w-full py-6 sm:py-12 md:py-24 lg:py-32">
          <div className="container flex flex-col items-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Automate Your Content Strategy
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-400 text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Generate, schedule, and manage your content with powerful automation tools. Save time and boost your productivity.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:gap-4">
              <Button onClick={handleGetStarted} className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto text-base sm:text-lg md:text-xl h-12 sm:h-12 md:h-14">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
              </Button>
            </div>
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
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 pt-12 md:grid-cols-3 lg:grid-cols-3">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <FileText className="h-10 w-10 text-white" />
                  <CardTitle className="text-white">Content Generation</CardTitle>
                  <CardDescription className="text-gray-400">
                    Generate high-quality content automatically with AI assistance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                 
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <Layers className="h-10 w-10 text-white" />
                  <CardTitle className="text-white">Content Sources</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitor and aggregate content from multiple sources.
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
                    Schedule your content for optimal engagement times.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                 
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing">
        <PricingSection onSubscribe={handleGetStarted} />
        </section>

        <section id="about">
          <ProcessFlow />
        </section>

        <section className="w-full  py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Start automating your content creation today
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of content creators who trust Content Pulse to
                  manage their content strategy.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button onClick={handleGetStarted} className="bg-white text-black hover:bg-gray-200"> 
                  Start a Free Trial
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