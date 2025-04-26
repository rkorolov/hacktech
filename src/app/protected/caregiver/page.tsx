"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { ROLES } from "@/convex/schema";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Users } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CaregiverDashboardPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const assignedPatients = useQuery(api.caregivers.getAssignedPatients);
  const router = useRouter();

  // Handle loading state for auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Handle unauthenticated state
  if (!isAuthenticated) {
     router.push('/auth?redirect=/protected/caregiver');
     return null;
  }

  // Check if the user is a caregiver
  if (user?.role !== ROLES.CAREGIVER) {
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
            You do not have permission to view this page. This section is for caregivers only.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  // Handle loading state for patient data
  if (assignedPatients === undefined) {
     return (
       <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="ml-4">Loading patient data...</p>
       </div>
     );
  }

  // User is authenticated and is a caregiver
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-8"
    >
      <h2 className="text-2xl font-bold mb-6 tracking-tight">My Patients</h2>
      <p className="text-muted-foreground mb-6">
        View and manage the patients assigned to you.
      </p>

      {assignedPatients.length === 0 ? (
        <p>You currently have no patients assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedPatients.map((patient) => (
            patient && ( // Ensure patient is not null
              <Card key={patient._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {patient.name || "Unnamed Patient"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Email: {patient.email || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {patient.phone || "N/A"}
                  </p>
                  {/* Add button/link to view full details later */}
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
      {/* Placeholder for future actions like adding notes */}
    </motion.div>
  );
}
