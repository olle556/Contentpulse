"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { FcGoogle } from 'react-icons/fc';




export default function Login() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", {
        callbackUrl,
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button 
            className="w-full flex items-center justify-center gap-2" 
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
