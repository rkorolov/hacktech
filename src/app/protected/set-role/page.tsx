"use client"

import { useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { SetRoleForm } from "@/components/protected/SetRoleForm"

export default function SetRolePage() {
  const router = useRouter()
  const needsRoleSelection = useQuery(api.users.needsRoleSelection)
  
  // Redirect to dashboard if user already has a role
  useEffect(() => {
    if (needsRoleSelection === false) {
      router.push("/protected")
    }
  }, [needsRoleSelection, router])
  
  // Show loading state while checking if user needs to set role
  if (needsRoleSelection === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  // If user doesn't need to set role, we'll redirect in the useEffect
  if (needsRoleSelection === false) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting to dashboard...</span>
      </div>
    )
  }
  
  // Show the role selection form
  return (
    <div className=" flex items-center justify-center min-h-screen container min-w-screen py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* <h2 className="text-2xl font-bold mb-6 tracking-tight text-center">Set Your Role</h2> */}
        
        <SetRoleForm />
        
        <p className="text-center text-muted-foreground mt-6 text-sm">
          You'll only need to set your role once. This helps us personalize your experience.
        </p>
      </motion.div>
    </div>
  )
}