"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
  symptoms: z.string().min(10, "Please describe your symptoms in at least 10 characters"),
  severity: z.enum(["mild", "moderate", "severe"], {
    required_error: "Please select the severity of your symptoms",
  }),
  contactInfo: z.string().min(5, "Please provide valid contact information"),
})

type FormValues = z.infer<typeof formSchema>

interface PatientFormProps {
  formId?: Id<"forms">
  onSuccess?: () => void
}

export function PatientForm({ formId, onSuccess }: PatientFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Mutations for creating and updating forms
  const createForm = useMutation(api.forms.createForm)
  const updateForm = useMutation(api.forms.updateForm)
  
  // Query existing form data if editing
  const existingForm = useQuery(api.forms.getFormById, formId ? { formId } : "skip")
  const isLoading = formId !== undefined && existingForm === undefined
  
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: 0,
      symptoms: "",
      severity: "mild" as "mild" | "moderate" | "severe",
      contactInfo: "",
    },
  })
  
  // Update form values when existingForm data is loaded
  useEffect(() => {
    if (existingForm && !isLoading) {
      form.reset({
        name: existingForm.name,
        age: existingForm.age,
        symptoms: existingForm.symptoms,
        severity: existingForm.severity as "mild" | "moderate" | "severe",
        contactInfo: existingForm.contactInfo,
      });
    }
  }, [existingForm, isLoading, form]);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    
    try {
      if (formId) {
        // Update existing form
        await updateForm({
          formId,
          ...values,
        })
        toast.success("Form updated successfully")
      } else {
        // Create new form
        await createForm(values)
        toast.success("Form submitted successfully")
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Otherwise redirect to forms list
        router.push("/protected/forms")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{formId ? "Update Patient Information" : "Patient Information Form"}</CardTitle>
        <CardDescription>
          {formId 
            ? "Update your health information to help us provide better care" 
            : "Please provide your health information to help us assess your needs"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your age" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your symptoms in detail" 
                      className="min-h-[120px]" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Please be as specific as possible about what you're experiencing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value} 
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mild">Mild - Noticeable but not interfering with daily activities</SelectItem>
                      <SelectItem value="moderate">Moderate - Affecting some daily activities</SelectItem>
                      <SelectItem value="severe">Severe - Significantly impacting daily life</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How severely are your symptoms affecting you?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Information</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Phone number or alternative contact method" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    How can we reach you if needed?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {formId ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  formId ? "Update Information" : "Submit Information"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}