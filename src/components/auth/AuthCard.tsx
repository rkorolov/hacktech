"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface AuthCardProps {
  onAuthSuccess?: () => void;
}

export function AuthCard({ onAuthSuccess }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
  
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  
    const redirectTo = searchParams.get("redirect") || "/protected/set-role";
    router.push(`/sign-in?redirect_url=${redirectTo}`);
  };

  return (
    <div className="flex items-center justify-center h-full flex-col">
      <Card className="min-w-[350px] pb-0 border shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Get Started</CardTitle>
          <CardDescription>
            Enter your email to log in or sign up
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleGetStarted}>
          <CardContent>
            <div className="flex justify-center">
              <Image
                src="/auth.svg" // Use /auth.svg because it's from public/ folder
                alt="Lock Icon"
                width={200}
                height={200}
                className="rounded-lg -mt-4"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="email">Enter your email</Label>
            </div>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  className="pl-9"
                  disabled={isLoading}
                  required
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                size="icon"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </form>

        <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
          Secured by{" "}
          <a
            href="https://vly.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            vly.ai
          </a>
        </div>
      </Card>
    </div>
  );
}
