"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { PatientList } from "@/components/caregiver/PatientList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, FileText, AlertTriangle } from "lucide-react"
import { ROLES } from "@/convex/schema"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function CaregiverDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // Redirect if user is not a caregiver
  useEffect(() => {
    if (!isLoading && user && user.role !== ROLES.CAREGIVER) {
      toast("Access Denied", {
        description: "You don't have permission to access the caregiver dashboard",
      })
      router.push("/protected")
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show access denied if user is not a caregiver
  if (user.role !== ROLES.CAREGIVER) {
    return (
      <div className="container max-w-5xl">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the caregiver dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please contact an administrator if you believe this is an error.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Caregiver Dashboard</h2>

        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patient List
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Review Forms
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>
                  View and manage patients sorted by priority. Click on a patient to view their details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle>Form Review</CardTitle>
                <CardDescription>
                  Review pending patient forms and provide recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Form review functionality will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}