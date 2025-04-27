"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/convex/schema"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Clock, Edit, Loader2, Save, Trash2, User, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AppointmentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const appointmentId = params.appointmentId as string
  
  const appointment = useQuery(
    api.appointments.getAppointmentById, 
    { appointmentId: appointmentId as Id<"appointments"> }
  )
  
  const updateAppointment = useMutation(api.appointments.updateAppointment)
  const deleteAppointment = useMutation(api.appointments.deleteAppointment)
  
  useEffect(() => {
    if (appointment && !isEditing) {
      setNotes(appointment.notes || "")
      setRecommendations(appointment.recommendations || "")
    }
  }, [appointment, isEditing])
  
  if (authLoading || appointment === undefined) {
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
        
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }
  
  if (!appointment) {
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
        
        <Card>
          <CardHeader>
            <CardTitle>Appointment Not Found</CardTitle>
            <CardDescription>
              The appointment you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/protected/appointments")}>
              Back to Appointments
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  
  const isPastAppointment = appointment.date < Date.now()
  
  const isPatient = user?.role === ROLES.PATIENT && appointment.patient?._id === user._id
  const isCaregiver = user?.role === ROLES.CAREGIVER && appointment.caregiver?._id === user._id
  
  const handleSaveChanges = async () => {
    setIsUpdating(true)
    try {
      await updateAppointment({
        appointmentId: appointment._id,
        notes,
        recommendations
      })
      toast.success("Appointment updated successfully")
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast.error("Failed to update appointment")
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleCancelAppointment = async () => {
    setIsDeleting(true)
    router.push("/protected/appointments")
    
    try {
      await deleteAppointment({ 
        appointmentId: appointment._id
      })
      toast.success("Appointment cancelled successfully")
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast.error("Failed to cancel appointment")
    }
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
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Appointment Details</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(appointment.date)} at {formatTime(appointment.date)}
                </CardDescription>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPastAppointment
                  ? "bg-gray-50 text-gray-700 border border-gray-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {isPastAppointment ? "Completed" : "Upcoming"}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Patient</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{appointment.patient?.name || "Unknown Patient"}</p>
                  </div>
                  {appointment.patient?.email && (
                    <p className="text-sm text-muted-foreground">
                      {appointment.patient.email}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Healthcare Provider</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{appointment.caregiver?.name || "Unknown Provider"}</p>
                  </div>
                  {appointment.caregiver?.specialty && (
                    <p className="text-sm text-muted-foreground">
                      {appointment.caregiver.specialty}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6"></div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Notes</h3>
                {isCaregiver && !isPastAppointment && !isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about the appointment..."
                  className="min-h-[100px] mb-4"
                />
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg">
                  {appointment.notes ? (
                    <p className="whitespace-pre-wrap">{appointment.notes}</p>
                  ) : (
                    <p className="text-muted-foreground">No notes available.</p>
                  )}
                </div>
              )}
            </div>
            
            {(isCaregiver || (appointment.recommendations && appointment.recommendations.length > 0)) && (
              <>
                <div className="border-t pt-6"></div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">Recommendations</h3>
                    {isCaregiver && !isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <Textarea
                      value={recommendations}
                      onChange={(e) => setRecommendations(e.target.value)}
                      placeholder="Add recommendations for the patient..."
                      className="min-h-[100px]"
                    />
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      {appointment.recommendations ? (
                        <p className="whitespace-pre-wrap">{appointment.recommendations}</p>
                      ) : (
                        <p className="text-muted-foreground">No recommendations available.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => router.push("/protected/appointments")}
              >
                Back to Appointments
              </Button>
            )}
            
            {!isEditing && !isPastAppointment && isCaregiver && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>No, Keep Appointment</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelAppointment();
                      }}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Yes, Cancel Appointment"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}