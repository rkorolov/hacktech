"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { SEVERITY } from "@/convex/schema"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PatientFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function PatientForm({ onSuccess, onCancel }: PatientFormProps) {
  const [symptoms, setSymptoms] = useState("")
  const [severity, setSeverity] = useState<string>(SEVERITY.MILD)
  const [contactInfo, setContactInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const createForm = useMutation(api.patientForms.createForm)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms")
      return
    }
    
    if (!contactInfo.trim()) {
      toast.error("Please provide your contact information")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await createForm({
        symptoms,
        severity: severity as typeof SEVERITY[keyof typeof SEVERITY],
        contactInfo
      })
      
      toast.success("Your information has been submitted successfully")
      
      // Reset form
      setSymptoms("")
      setSeverity(SEVERITY.MILD)
      setContactInfo("")
      
      if (onSuccess) {
        onSuccess()
      } else {
        // Navigate to dashboard if no success handler
        router.push("/protected")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit form")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Patient Information Form</CardTitle>
        <CardDescription>
          Please provide information about your symptoms and how we can contact you
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="symptoms">Describe your symptoms</Label>
            <Textarea
              id="symptoms"
              placeholder="Please describe what you're experiencing..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-[120px]"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Severity</Label>
            <RadioGroup 
              value={severity} 
              onValueChange={setSeverity}
              className="flex flex-col space-y-1"
              disabled={isSubmitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={SEVERITY.MILD} id="mild" />
                <Label htmlFor="mild" className="font-normal">Mild - Uncomfortable but manageable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={SEVERITY.MODERATE} id="moderate" />
                <Label htmlFor="moderate" className="font-normal">Moderate - Interfering with daily activities</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={SEVERITY.SEVERE} id="severe" />
                <Label htmlFor="severe" className="font-normal">Severe - Significantly impacting quality of life</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Information</Label>
            <Textarea
              id="contactInfo"
              placeholder="Phone number, preferred contact method, best time to reach you..."
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Information"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}