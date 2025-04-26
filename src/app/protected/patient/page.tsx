"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { PatientProfileForm } from "@/components/protected/patient/PatientProfileForm";
import { Loader2 } from "lucide-react";
import { ROLES } from "@/convex/schema"; // Import ROLES
import { useRouter } from "next/navigation"; // Import useRouter
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function PatientDashboardPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Handle unauthenticated state or incorrect role
  if (!isAuthenticated) {
     // This should ideally be handled by middleware, but as a fallback:
     router.push('/auth?redirect=/protected/patient');
     return null; // Return null while redirecting
  }

  // Check if the user is a patient
  if (user?.role !== ROLES.PATIENT) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container py-8"
      >
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. This section is for patients only.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  // User is authenticated and is a patient
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-8"
    >
      <h2 className="text-2xl font-bold mb-6 tracking-tight">My Profile</h2>
      <p className="text-muted-foreground mb-6">
        View and update your personal and medical information below.
      </p>
      <PatientProfileForm />
    </motion.div>
  );
}
