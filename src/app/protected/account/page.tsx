"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/convex/schema"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, User, LogOut } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Form validation schemas
const caregiverFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  specialty: z.string().min(2, "Specialty must be at least 2 characters"),
});

const patientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type CaregiverFormValues = z.infer<typeof caregiverFormSchema>;
type PatientFormValues = z.infer<typeof patientFormSchema>;

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, signOut } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formInitializedRef = useRef(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  
  // Mutations for updating profiles
  const updateCaregiverProfile = useMutation(api.users.updateCaregiverProfile)
  const updatePatientProfile = useMutation(api.users.updatePatientProfile)
  
  // Initialize caregiver form
  const caregiverForm = useForm<CaregiverFormValues>({
    resolver: zodResolver(caregiverFormSchema),
    defaultValues: {
      name: "",
      specialty: "",
    },
  });
  
  // Initialize patient form
  const patientForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
    },
  });
  
  // Update form values when user data is loaded
  useEffect(() => {
    if (user && !formInitializedRef.current) {
      if (user.role === ROLES.CAREGIVER) {
        caregiverForm.reset({
          name: user.name || "",
          specialty: user.specialty || "",
        });
      } else if (user.role === ROLES.PATIENT) {
        patientForm.reset({
          name: user.name || "",
        });
      }
      formInitializedRef.current = true;
    }
  }, [user]);
  
  // Handle sign out confirmation
  const handleSignOutClick = () => {
    setShowSignOutConfirm(true)
  }
  
  // Handle confirmed sign out
  const handleConfirmedSignOut = async () => {
    signOut()
    router.push('/')
    setShowSignOutConfirm(false)
  }
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!user) {
    router.push("/protected")
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    )
  }
  
  // Handle caregiver form submission
  const onCaregiverSubmit = async (values: CaregiverFormValues) => {
    setIsSubmitting(true)
    
    try {
      await updateCaregiverProfile({
        name: values.name,
        specialty: values.specialty,
      })
      
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle patient form submission
  const onPatientSubmit = async (values: PatientFormValues) => {
    setIsSubmitting(true)
    
    try {
      await updatePatientProfile({
        name: values.name,
      })
      
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Account Settings</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              {user.role === ROLES.CAREGIVER 
                ? "Update your name and specialty information"
                : "Update your personal information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.role === ROLES.CAREGIVER ? (
              <Form {...caregiverForm}>
                <form onSubmit={caregiverForm.handleSubmit(onCaregiverSubmit)} className="space-y-6">
                  <FormField
                    control={caregiverForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the name that will be displayed to patients
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={caregiverForm.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Specialty</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Cardiology, Pediatrics, General Practice" 
                            {...field} 
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Your medical specialty or area of expertise
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !caregiverForm.formState.isDirty}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Form {...patientForm}>
                <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-6">
                  <FormField
                    control={patientForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the name that will be displayed to healthcare providers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !patientForm.formState.isDirty}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                <p>{user.email || "No email provided"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <p>{user.role === ROLES.CAREGIVER ? "Healthcare Provider" : "Patient"}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              variant="outline" 
              className="gap-2 text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOutClick}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Sign Out Confirmation Dialog */}
      <Dialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setShowSignOutConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmedSignOut}>
              Yes, Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}