"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams?.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Callback":
        return "There was a problem signing you in. Please try again.";
      case "OAuthSignin":
        return "Error starting the sign in process. Please try again.";
      case "OAuthCallback":
        return "Error completing the sign in process. Please try again.";
      case "Configuration":
        return "There is a problem with the server configuration.";
      default:
        return "An unexpected authentication error occurred.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {getErrorMessage(error)}
          </p>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/authentication/login")}
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/")}
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}