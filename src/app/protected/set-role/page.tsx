"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UserCog, ClipboardList } from "lucide-react"
import { ROLES } from "@/convex/schema"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function SetRolePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const setUserRole = useMutation(api.users.setUserRole)
  
  const handleSetRole = async (role: typeof ROLES[keyof typeof ROLES]) => {
    setIsSubmitting(true)
    
    try {
      await setUserRole({ role })
      
      toast.success(`Role set to ${role}`)
      
      // Redirect to the appropriate dashboard
      if (role === ROLES.PATIENT) {
        router.push("/protected/patient")
      } else if (role === ROLES.CAREGIVER) {
        router.push("/protected/caregiver")
      } else {
        router.push("/protected")
      }
    } catch (error) {
      toast.error("Failed to set role")
      console.error(error)
      setIsSubmitting(false)
    }
  }
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  return (
    <div className="container max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Select Your Role</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-500" />
                  Patient
                </CardTitle>
                <CardDescription>
                  Submit health information and receive care recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  As a patient, you can:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>Submit information about your symptoms</li>
                  <li>Track your submission history</li>
                  <li>Receive recommendations from caregivers</li>
                  <li>Update your contact information</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSetRole(ROLES.PATIENT)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting role...
                    </>
                  ) : (
                    "Continue as Patient"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-purple-500" />
                  Caregiver
                </CardTitle>
                <CardDescription>
                  Manage patients and provide healthcare recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  As a caregiver, you can:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>View patients sorted by priority</li>
                  <li>Review patient information</li>
                  <li>Add notes to patient records</li>
                  <li>Create and send recommendations</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSetRole(ROLES.CAREGIVER)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting role...
                    </>
                  ) : (
                    "Continue as Caregiver"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
        
        {user?.role && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Your current role: <span className="font-medium text-foreground">{user.role}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You can change your role at any time by returning to this page.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}