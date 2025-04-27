"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/convex/schema"

import { PatientForm } from "@/components/protected/PatientForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit, 
  Loader2, 
  User 
} from "lucide-react"

export default function FormDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  
  // Get the form ID from the URL
  const formId = params.formId as string
  
  // Fetch the form data
  const form = useQuery(
    api.forms.getFormById, 
    { formId: formId as Id<"forms"> }
  )
  
  // Loading state
  if (authLoading || form === undefined) {
    return (
      <div className="container max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }
  
  // Handle form not found
  if (!form) {
    return (
      <div className="container max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Form Not Found</CardTitle>
            <CardDescription>
              The health form you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/protected/forms")}>
              Back to Forms
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  // Check if the user is authorized to view this form
  const isPatientOwner = user?.role === ROLES.PATIENT && form.patientId === user._id
  const isCaregiver = user?.role === ROLES.CAREGIVER
  
  if (!isPatientOwner && !isCaregiver) {
    router.push("/protected")
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    )
  }
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }
  
  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "mild":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Mild</Badge>
      case "moderate":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Moderate</Badge>
      case "severe":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Severe</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }
  
  // Handle successful form edit
  const handleEditSuccess = () => {
    setIsEditing(false)
    toast.success("Form updated successfully")
  }
  
  // If in editing mode and user is the patient owner, show the edit form
  if (isEditing && isPatientOwner) {
    return (
      <div className="container max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1" 
            onClick={() => setIsEditing(false)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Details
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 tracking-tight">Edit Health Form</h2>
          
          <PatientForm 
            formId={form._id} 
            onSuccess={handleEditSuccess} 
          />
        </motion.div>
      </div>
    )
  }
  
  // Otherwise, show the form details
  return (
    <div className="container max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Health Form Details</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4" />
                  Submitted on {formatDate(form.submittedAt)}
                </CardDescription>
              </div>
              
              {/* <div className="flex items-center gap-2">
                {getSeverityBadge(form.severity)}
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Priority: {form.priorityScore.toFixed(1)}
                </Badge>
              </div> */}

            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{form.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p>{form.age}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
                  <p>{form.contactInfo}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Symptoms</h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="whitespace-pre-wrap">{form.symptoms}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Severity Assessment</h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium">Reported Severity:</p>
                  {getSeverityBadge(form.severity)}
                </div>
                <div className="flex items-center gap-2">
                  {/* <p className="font-medium">Priority Score:</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {form.priorityScore.toFixed(1)}
                  </Badge> */}
                </div>
                {/* <p className="text-sm text-muted-foreground mt-2">
                  Priority scores are calculated based on severity and wait time. Higher scores indicate higher priority.
                </p> */}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push("/protected/forms")}
            >
              Back to Forms
            </Button>
            
            {isPatientOwner && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit Form
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}