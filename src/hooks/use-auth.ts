"use client";

import { api } from "@/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useUser, useClerk } from "@clerk/clerk-react";

import { useEffect, useState } from "react";

export function useAuth() {
  const { isLoaded, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && user !== undefined && isLoaded) {
      setIsLoading(false);
    }
  }, [isAuthLoading, user, isLoaded]);

  return {
    isLoading,
    isAuthenticated,
    user,
    clerkUser,
    signOut, // only signOut for now — signIn handled automatically by Clerk
  };
}
