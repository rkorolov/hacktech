"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const formSchema = z.object({
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.string().optional(),
  insuranceInformation: z.string().optional(),
});

type PatientProfileFormValues = z.infer<typeof formSchema>;

export function PatientProfileForm() {
  const patientProfile = useQuery(api.patients.getMyPatientProfile);
  const updateProfile = useMutation(api.patients.updateMyPatientProfile);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateOfBirth: "",
      phone: "",
      address: "",
      medicalHistory: "",
      emergencyContact: "",
      insuranceInformation: "",
    },
  });

  React.useEffect(() => {
    if (patientProfile) {
      form.reset({
        dateOfBirth: patientProfile.dateOfBirth ?? "",
        phone: patientProfile.phone ?? "",
        address: patientProfile.address ?? "",
        medicalHistory: patientProfile.medicalHistory ?? "",
        emergencyContact: patientProfile.emergencyContact ?? "",
        insuranceInformation: patientProfile.insuranceInformation ?? "",
      });
    }
  }, [patientProfile, form]);

  async function onSubmit(values: PatientProfileFormValues) {
    setIsSubmitting(true);
    try {
      await updateProfile(values);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (patientProfile === undefined) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input placeholder="YYYY-MM-DD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Your full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="medicalHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medical History</FormLabel>
                <FormControl>
                  <Textarea placeholder="Relevant medical history (allergies, conditions, etc.)" {...field} />
                </FormControl>
                <FormDescription>
                  Please provide a summary of your medical background.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Name and phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insuranceInformation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Information</FormLabel>
                <FormControl>
                  <Textarea placeholder="Provider, policy number, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}