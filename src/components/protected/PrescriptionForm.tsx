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
import { Loader2, Pill, Save } from "lucide-react"

// Form validation schema
const formSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  medicationName: z.string().min(2, "Medication name must be at least 2 characters"),
  dosage: z.string().min(2, "Dosage must be at least 2 characters"),
  refillsRemaining: z.coerce.number().int().min(0, "Refills must be a non-negative number"),
});

type FormValues = z.infer<typeof formSchema>;

interface PrescriptionFormProps {
  patientId?: Id<"users">;
  onSuccess?: () => void;
}

export function PrescriptionForm({ patientId, onSuccess }: PrescriptionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get all patients for the dropdown
  const patients = useQuery(api.users.getAllPatients)
  
  // Mutation for creating a prescription
  const createPrescription = useMutation(api.prescriptions.createPrescription)
  
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: patientId?.toString() || "",
      medicationName: "",
      dosage: "",
      refillsRemaining: 0,
    },
  });
  
  // Update form values when patientId prop changes
  useEffect(() => {
    if (patientId) {
      form.setValue("patientId", patientId.toString());
    }
  }, [patientId, form]);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    
    try {
      await createPrescription({
        patientId: values.patientId as Id<"users">,
        medicationName: values.medicationName,
        dosage: values.dosage,
        refillsRemaining: values.refillsRemaining,
      })
      
      toast.success("Prescription created successfully")
      
      // Reset form
      form.reset({
        patientId: patientId?.toString() || "",
        medicationName: "",
        dosage: "",
        refillsRemaining: 0,
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Otherwise redirect to prescriptions list
        router.push("/protected/prescriptions");
      }
    } catch (error) {
      console.error("Error creating prescription:", error)
      toast.error("Failed to create prescription. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Prescription</CardTitle>
        <CardDescription>
          Create a new prescription for a patient
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!patientId && (
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting || patients === undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            {patient.latestForm?.name || patient.name || "Anonymous Patient"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the patient for this prescription
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="medicationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter medication name" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the full name of the medication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage Instructions</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 10mg twice daily with food" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Include amount, frequency, and any special instructions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="refillsRemaining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Refills</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0}
                      placeholder="Enter number of refills" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    How many times can this prescription be refilled
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
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Pill className="h-4 w-4" />
                    Create Prescription
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}