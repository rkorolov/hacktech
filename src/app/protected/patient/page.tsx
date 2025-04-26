"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { PatientForm } from "@/components/patient/PatientForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, PlusCircle, FileEdit, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { SEVERITY } from "@/convex/schema"
import { motion } from "framer-motion"

// Get severity badge color - moved outside component to be accessible to FormCard
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

export default function PatientDashboard() {
  const [showNewForm, setShowNewForm] = useState(false)
  const patientForms = useQuery(api.patientForms.getPatientForms)

  // Handle form submission success
  const handleFormSuccess = () => {
    setShowNewForm(false)
    toast("Form Submitted", {
      description: "Your information has been submitted successfully",
    })
  }

  return (
    <div className="container max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Patient Dashboard</h2>

        {!showNewForm ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to your Health Portal</CardTitle>
                <CardDescription>
                  Submit your health information and track your submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Use this dashboard to submit information about your symptoms and track your previous submissions.
                  Our caregivers will review your information and provide recommendations based on your needs.
                </p>
                <Button 
                  onClick={() => setShowNewForm(true)}
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Submit New Information
                </Button>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Your Submissions</h3>
              
              {patientForms === undefined ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : patientForms.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">You haven't submitted any information yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Submissions</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <div className="space-y-4">
                      {patientForms.map((form) => (
                        <FormCard key={form._id} form={form} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pending">
                    <div className="space-y-4">
                      {patientForms
                        .filter(form => form.status === "pending")
                        .map((form) => (
                          <FormCard key={form._id} form={form} />
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviewed">
                    <div className="space-y-4">
                      {patientForms
                        .filter(form => form.status === "reviewed")
                        .map((form) => (
                          <FormCard key={form._id} form={form} />
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        ) : (
          <div>
            <PatientForm 
              onSuccess={handleFormSuccess} 
              onCancel={() => setShowNewForm(false)} 
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Form card component to display individual submissions
function FormCard({ form }: { form: any }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Symptom Report</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            form.status === "pending" 
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          }`}>
            {form.status === "pending" ? "Pending Review" : "Reviewed"}
          </span>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Submitted {formatDistanceToNow(new Date(form.submissionDate), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium">Symptoms:</span>
            <p className="text-sm text-muted-foreground mt-1">{form.symptoms}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Severity:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(form.severity)}`}>
              {form.severity}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {form.status === "pending" && (
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileEdit className="h-3 w-3" />
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}