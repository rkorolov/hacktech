"use client";

import { AuthCard } from "@/components/auth/AuthCard"; // assuming you have an AuthCard (form) component
import { useAuth } from "@/hooks/use-auth"; // or wherever your custom hook is
import { SignUp, SignUpButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function SignIn() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(searchParams.get("redirect") || "/protected"); // or wherever you want to send signed-in users
    }
  }, [isLoading, isAuthenticated, searchParams, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      {/* <AuthCard /> */}
      <SignUpButton/>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignIn />
    </Suspense>
  );
}

// "use client";

// import { AuthCard } from "@/components/auth/AuthCard";
// import { useAuth } from "@/hooks/use-auth";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Suspense, useEffect } from "react";

// function SignIn() {
//   const { isLoading, isAuthenticated } = useAuth();
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     if (!isLoading && isAuthenticated) {
//       router.push(searchParams.get("redirect") || "/protected");
//     }
//   }, [isLoading, isAuthenticated, searchParams]);

//   return (
//     <div className="flex h-screen items-center justify-center">
//       <AuthCard />
//     </div>
//   );
// }

// export default function SignInPage() {
//   return (
//     <Suspense>
//       <SignIn />
//     </Suspense>
//   );
// }
