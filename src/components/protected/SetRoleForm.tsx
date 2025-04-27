"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ROLES } from "@/convex/schema"
import { motion } from "framer-motion"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, UserCog } from "lucide-react"

// Form validation schema
const formSchema = z.object({
  role: z.enum([ROLES.PATIENT, ROLES.CAREGIVER], {
    required_error: "Please select a role",
  }),
  specialty: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function SetRoleForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Mutation for setting user role
  const setUserRole = useMutation(api.users.setUserRole)
  
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: undefined,
      specialty: "",
    },
  })
  
  // Watch the role field to conditionally show specialty field
  const watchedRole = form.watch("role")
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    // Validate specialty field for caregivers
    if (values.role === ROLES.CAREGIVER && (!values.specialty || values.specialty.trim().length < 2)) {
      form.setError("specialty", {
        type: "manual",
        message: "Specialty is required for caregivers and must be at least 2 characters"
      });
      return;
    }
    
    setIsSubmitting(true)
    
    try {
      await setUserRole({
        role: values.role,
        specialty: values.role === ROLES.CAREGIVER ? values.specialty : undefined,
      })
      
      toast.success("Role set successfully")
      
      // Redirect to dashboard
      router.push("/protected")
    } catch (error) {
      console.error("Error setting role:", error)
      toast.error(error instanceof Error ? error.message : "Failed to set role. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Clinic Connect</CardTitle>
          <CardDescription>
            Please select your role to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ROLES.PATIENT} className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Patient</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={ROLES.CAREGIVER} className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4" />
                            <span>Healthcare Provider</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select whether you are a patient seeking care or a healthcare provider.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchedRole === ROLES.CAREGIVER && (
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Specialty</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Cardiology, Pediatrics, General Practice" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter your medical specialty or area of expertise.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Role...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  )
}