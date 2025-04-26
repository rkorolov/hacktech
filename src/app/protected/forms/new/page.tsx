"use client"

import { PatientForm } from "@/components/protected/PatientForm"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/convex/schema"

export default function NewFormPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  
  const handleSuccess = () => {
    router.push("/protected/forms")
  }
  
  // Check if user is authorized (must be a patient)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  // Redirect caregivers to dashboard
  if (!user || user.role !== ROLES.PATIENT) {
    router.push("/protected")
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    )
  }
  
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
        <h2 className="text-2xl font-bold mb-6 tracking-tight">New Patient Form</h2>
        
        <PatientForm onSuccess={handleSuccess} />
      </motion.div>
    </div>
  )
}