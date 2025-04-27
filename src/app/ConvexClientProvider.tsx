"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { convex } from "@/lib/convexClient";
import { ReactNode } from "react";


export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
