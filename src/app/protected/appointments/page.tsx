"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/convex/schema"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, Loader2, User, UserPlus, Filter } from "lucide-react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function AppointmentsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past">("all")
  
  const patientAppointments = useQuery(
    api.appointments.getPatientAppointments,
    user?.role === ROLES.PATIENT ? {} : "skip"
  )
  
  const caregiverAppointments = useQuery(
    api.appointments.getCaregiverAppointments,
    user?.role === ROLES.CAREGIVER ? { status: statusFilter } : "skip"
  )

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (user?.role === ROLES.PATIENT) {
    const appointments = patientAppointments;
    
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

    const upcomingAppointments = appointments?.filter(app => app.date > Date.now()) || [];
    const pastAppointments = appointments?.filter(app => app.date <= Date.now()) || [];

    return (
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Your Appointments</h2>
          
          <Tabs 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as "all" | "upcoming" | "past")}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-3 w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {appointments === undefined ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No appointments scheduled</CardTitle>
                <CardDescription>
                  You don't have any appointments scheduled at this time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your healthcare provider will schedule appointments for you after reviewing your health information.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {(statusFilter === "all" || statusFilter === "upcoming") && upcomingAppointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>
                      Your scheduled appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Caregiver</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingAppointments.map((appointment) => (
                          <TableRow key={appointment._id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(appointment.date)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {appointment.caregiver?.name || "Unknown Caregiver"}
                                  {appointment.caregiver?.specialty && (
                                    <span className="text-muted-foreground text-sm block">
                                      {appointment.caregiver.specialty}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Upcoming
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => router.push(`/protected/appointments/${appointment._id}`)}
                              >
                                <FileText className="h-4 w-4" />
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              
              {(statusFilter === "all" || statusFilter === "past") && pastAppointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Past Appointments</CardTitle>
                    <CardDescription>
                      Your appointment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Caregiver</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastAppointments.map((appointment) => (
                          <TableRow key={appointment._id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(appointment.date)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {appointment.caregiver?.name || "Unknown Caregiver"}
                                  {appointment.caregiver?.specialty && (
                                    <span className="text-muted-foreground text-sm block">
                                      {appointment.caregiver.specialty}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                Completed
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => router.push(`/protected/appointments/${appointment._id}`)}
                              >
                                <FileText className="h-4 w-4" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              
              {statusFilter === "upcoming" && upcomingAppointments.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No upcoming appointments</CardTitle>
                    <CardDescription>
                      You don't have any upcoming appointments scheduled.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Your healthcare provider will schedule appointments for you after reviewing your health information.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {statusFilter === "past" && pastAppointments.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No past appointments</CardTitle>
                    <CardDescription>
                      You don't have any past appointment records.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
    )
  }
  
  if (user?.role === ROLES.CAREGIVER) {
    const allAppointments = caregiverAppointments;
    
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
    
    const upcomingAppointments = allAppointments?.filter(app => app.date > Date.now()) || [];
    const pastAppointments = allAppointments?.filter(app => app.date <= Date.now()) || [];
    
    return (
      <div className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">All Appointments</h2>
          
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Tabs 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as "all" | "upcoming" | "past")}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              onClick={() => router.push("/protected/appointments/new")}
              className="whitespace-nowrap"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {allAppointments === undefined ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allAppointments.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No appointments found</CardTitle>
                <CardDescription>
                  You haven't scheduled any appointments yet.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <UserPlus className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                <p className="text-muted-foreground text-center mb-6">
                  Find a patient to schedule an appointment with
                </p>
                <Button 
                  onClick={() => router.push("/protected/patients")}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  View Patient List
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {(statusFilter === "all" || statusFilter === "upcoming") && upcomingAppointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>
                      Manage your upcoming appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingAppointments.map((appointment) => (
                          <TableRow key={appointment._id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(appointment.date)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {appointment.patient?.name || "Unknown Patient"}
                                  {appointment.patient?.email && (
                                    <span className="text-muted-foreground text-sm block">
                                      {appointment.patient.email}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Upcoming
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => router.push(`/protected/appointments/${appointment._id}`)}
                              >
                                <FileText className="h-4 w-4" />
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              
              {(statusFilter === "all" || statusFilter === "past") && pastAppointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Past Appointments</CardTitle>
                    <CardDescription>
                      View your past appointment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastAppointments.map((appointment) => (
                          <TableRow key={appointment._id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(appointment.date)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {appointment.patient?.name || "Unknown Patient"}
                                  {appointment.patient?.email && (
                                    <span className="text-muted-foreground text-sm block">
                                      {appointment.patient.email}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                Completed
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => router.push(`/protected/appointments/${appointment._id}`)}
                              >
                                <FileText className="h-4 w-4" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              
              {statusFilter === "upcoming" && upcomingAppointments.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No upcoming appointments</CardTitle>
                    <CardDescription>
                      You don't have any upcoming appointments scheduled.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Schedule appointments with patients by clicking the "New" button.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {statusFilter === "past" && pastAppointments.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No past appointments</CardTitle>
                    <CardDescription>
                      You don't have any past appointment records.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  }
  
  router.push("/protected")
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Redirecting...</span>
    </div>
  )
}