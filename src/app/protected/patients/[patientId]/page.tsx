"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams, useRouter } from "next/navigation"
import { Id } from "@/convex/_generated/dataModel"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/convex/schema"
import { motion } from "framer-motion"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Loader2, 
  Mail, 
  MessageSquare, 
  Pill, 
  Plus, 
  User 
} from "lucide-react"

export default function PatientDetailsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const patientId = params.patientId as string
  
  const patient = useQuery(
    api.users.getUserById, 
    { id: patientId as Id<"users"> }
  )
  
  const forms = useQuery(
    api.forms.getFormsByPatientId,
    { patientId: patientId as Id<"users"> }
  )
  
  const appointments = useQuery(
    api.appointments.getAppointmentsByPatientId,
    { patientId: patientId as Id<"users"> }
  )
  
  const prescriptions = useQuery(
    api.prescriptions.getPrescriptionsByPatientId,
    { patientId: patientId as Id<"users"> }
  )
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!user || user.role !== ROLES.CAREGIVER) {
    return (
      <div className="container">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You must be a healthcare provider to view patient details.
          </p>
          <Button onClick={() => router.push("/protected")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
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
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "mild":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Mild</Badge>
      case "moderate":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Moderate</Badge>
      case "severe":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Severe</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }
  
  const isLoading = !patient || !forms || !appointments || !prescriptions
  
  if (isLoading) {
    return (
      <div className="container">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 gap-1" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="container">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6 gap-1" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={patient.image} />
                <AvatarFallback className="text-lg">
                  {patient.name ? patient.name.charAt(0).toUpperCase() : <User />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <CardTitle className="text-2xl">{patient.name || "Unnamed Patient"}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <CardDescription>{patient.email || "No email provided"}</CardDescription>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => router.push(`/protected/messages?patient=${patientId}`)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => router.push(`/protected/appointments/new?patient=${patientId}`)}
                >
                  <Plus className="h-4 w-4" />
                  Schedule Appointment
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Tabs defaultValue="forms" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="forms" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Health Forms</span>
              <span className="sm:hidden">Forms</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Appointments</span>
              <span className="sm:hidden">Appts</span>
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="gap-2">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Prescriptions</span>
              <span className="sm:hidden">Meds</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle>Health Forms</CardTitle>
                <CardDescription>
                  Patient-submitted health information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {forms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No health forms submitted by this patient.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Symptoms</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forms.map((form) => (
                        <TableRow key={form._id}>
                          <TableCell className="font-medium">
                            {formatDate(form.submittedAt)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {form.symptoms}
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(form.severity)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {form.priorityScore.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/protected/forms/${form._id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>
                    Scheduled and past appointments
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => router.push(`/protected/appointments/new?patient=${patientId}`)}
                >
                  <Plus className="h-4 w-4" />
                  New Appointment
                </Button>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments scheduled for this patient.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => {
                        const isPast = appointment.date < Date.now();
                        
                        return (
                          <TableRow key={appointment._id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{formatDate(appointment.date)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(appointment.date)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {appointment.caregiver?.name || "Unknown Provider"}
                              {appointment.caregiver?.specialty && (
                                <span className="text-xs text-muted-foreground block">
                                  {appointment.caregiver.specialty}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isPast ? (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Upcoming
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/protected/appointments/${appointment._id}`)}
                              >
                                {isPast ? "View Notes" : "Manage"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Prescriptions</CardTitle>
                  <CardDescription>
                    Current and past medications
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => router.push(`/protected/prescriptions/new?patient=${patientId}`)}
                >
                  <Plus className="h-4 w-4" />
                  New Prescription
                </Button>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No prescriptions for this patient.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Prescribed By</TableHead>
                        <TableHead>Refills</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((prescription) => (
                        <TableRow key={prescription._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-purple-500" />
                              {prescription.medicationName}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Prescribed {formatDate(prescription.prescribedAt)}
                            </span>
                          </TableCell>
                          <TableCell>{prescription.dosage}</TableCell>
                          <TableCell>
                            {prescription.prescriber?.name || "Unknown Provider"}
                            {prescription.prescriber?.specialty && (
                              <span className="text-xs text-muted-foreground block">
                                {prescription.prescriber.specialty}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {prescription.refillsRemaining > 0 ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {prescription.refillsRemaining} remaining
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                No refills
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/protected/prescriptions/${prescription._id}`)}
                            >
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}