"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, ArrowUpDown, Clock, AlertTriangle, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ROLES, SEVERITY } from "@/convex/schema"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { motion } from "framer-motion"

// Get severity badge color
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case SEVERITY.MILD:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case SEVERITY.MODERATE:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case SEVERITY.SEVERE:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

// Get priority score badge color
const getPriorityColor = (score: number) => {
  if (score >= 4) {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  } else if (score >= 2.5) {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  } else {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }
}

export default function FormsReviewPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("pending")
  
  // Redirect if user is not a caregiver
  useEffect(() => {
    if (!authLoading && user && user.role !== ROLES.CAREGIVER) {
      toast("Access Denied", {
        description: "You don't have permission to access the forms review page",
      })
      router.push("/protected")
    }
  }, [user, authLoading, router])
  
  // Fetch forms by status
  const pendingForms = useQuery(api.patientForms.getFormsByStatus, { 
    status: "pending" 
  })
  
  const reviewedForms = useQuery(api.patientForms.getFormsByStatus, { 
    status: "reviewed" 
  })
  
  // Show loading state while checking authentication
  if (authLoading || !user) {
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
              You don't have permission to access the forms review page
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
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Forms Review</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
              {pendingForms && pendingForms.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingForms.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reviewed Forms
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Forms</CardTitle>
                <CardDescription>
                  Forms awaiting review, sorted by priority
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingForms === undefined ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingForms.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending forms to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingForms
                      .sort((a, b) => b.priorityScore - a.priorityScore)
                      .map(form => (
                        <FormCard 
                          key={form._id} 
                          form={form} 
                          onClick={() => router.push(`/protected/caregiver/patient/${form.patientId}`)}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviewed">
            <Card>
              <CardHeader>
                <CardTitle>Reviewed Forms</CardTitle>
                <CardDescription>
                  Forms that have been reviewed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviewedForms === undefined ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : reviewedForms.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reviewed forms</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewedForms
                      .sort((a, b) => b.submissionDate - a.submissionDate)
                      .map(form => (
                        <FormCard 
                          key={form._id} 
                          form={form} 
                          onClick={() => router.push(`/protected/caregiver/patient/${form.patientId}`)}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

// Form card component
function FormCard({ form, onClick }: { form: any, onClick: () => void }) {
  // Fetch patient data for the form
  const patient = useQuery(api.users.getUserById, { userId: form.patientId })
  
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {patient?.name || "Loading patient..."}
            </CardTitle>
            <CardDescription>
              {patient?.email || ""}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={getPriorityColor(form.priorityScore)}>
              Priority: {form.priorityScore.toFixed(1)}
            </Badge>
            <Badge variant="outline" className={getSeverityColor(form.severity)}>
              {form.severity}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium">Symptoms</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{form.symptoms}</p>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Submitted {formatDistanceToNow(new Date(form.submissionDate), { addSuffix: true })}
            </span>
            <Badge variant="outline" className={
              form.status === "pending" 
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            }>
              {form.status === "pending" ? "Pending" : "Reviewed"}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full">
          {form.status === "pending" ? "Review Form" : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  )
}