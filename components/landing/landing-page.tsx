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

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    toast.success("Redirecting to login...");
    router.push('/authentication/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Header onLogin={handleGetStarted} />
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
              <Button className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-gray-800 w-full sm:w-auto">
                View Demo
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-6 sm:py-12 md:py-24 lg:py-32" id="features">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-800 px-3 py-1 text-sm">
                  Features
                </div>
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                  Everything you need to scale
                </h2>
                <p className="mx-auto max-w-[900px] text-gray-400 text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Powerful features to help you manage, create, and schedule your content with ease.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 pt-12 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <FileText className="h-10 w-10 text-white" />
                  <CardTitle className="text-white">Content Generation</CardTitle>
                  <CardDescription className="text-gray-400">
                    Generate high-quality content automatically with AI assistance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    4 posts generated on average per day
                  </p>
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
                  <p className="text-sm text-gray-400">
                    2 active content sources monitored
                  </p>
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
                  <p className="text-sm text-gray-400">
                    1 active schedule managing your content
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full border-t border-gray-800 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Start automating your content today
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of content creators who trust Content Pulse to
                  manage their content strategy.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="bg-white text-black hover:bg-gray-200">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-gray-800">
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}