"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter, useSearchParams } from "next/navigation"
import { Id } from "@/convex/_generated/dataModel"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/convex/schema"

import { PrescriptionForm } from "@/components/protected/PrescriptionForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function NewPrescriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  
  // Get patient ID from URL if provided
  const patientIdFromUrl = searchParams.get("patient")
  
  // Check if user is authorized (must be a caregiver)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!user || user.role !== ROLES.CAREGIVER) {
    router.push("/protected")
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    )
  }
  
  const handleSuccess = () => {
    if (patientIdFromUrl) {
      router.push(`/protected/patients/${patientIdFromUrl}`)
    } else {
      router.push("/protected/prescriptions")
    }
  }
  
  return (
    <div className="container max-w-2xl">
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
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Create New Prescription</h2>
        
        <PrescriptionForm 
          patientId={patientIdFromUrl as Id<"users">} 
          onSuccess={handleSuccess}
        />
      </motion.div>
    </div>
  )
}