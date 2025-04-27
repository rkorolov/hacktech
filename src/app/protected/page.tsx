"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/convex/schema";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { 
  FileText, 
  Calendar, 
  PlusCircle, 
  Pill, 
  AlertTriangle, 
  Clock, 
  User, 
  Loader2,
  ChevronDown,
  Filter,
  CalendarX,
  CheckCircle,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProtectedPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [appointmentFilter, setAppointmentFilter] = useState<"all" | "with_appointments" | "without_appointments">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const patientsWithoutAppointments = useQuery(
    api.forms.getFormsWithoutAppointments,
    user?.role === ROLES.CAREGIVER ? { limit: 10 } : "skip"
  );
  
  const patientFormsByStatus = useQuery(
    api.forms.getFormsByAppointmentStatus,
    user?.role === ROLES.CAREGIVER ? { 
      status: appointmentFilter,
      limit: 20 
    } : "skip"
  );
  
  const patientOwnForms = useQuery(
    api.forms.getPatientForms,
    user?.role === ROLES.PATIENT ? {} : "skip"
  );
  
  const patientAppointments = useQuery(
    api.appointments.getPatientAppointments,
    user?.role === ROLES.PATIENT ? {} : "skip"
  );
  
  const patientPrescriptions = useQuery(
    api.prescriptions.getPatientPrescriptions,
    user?.role === ROLES.PATIENT ? {} : "skip"
  );
  
  const allPatients = useQuery(
    api.users.getAllPatients,
    user?.role === ROLES.CAREGIVER ? {} : "skip"
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTimeAgo = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
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
  };

  if (user?.role === ROLES.CAREGIVER) {
    const filteredPatients = allPatients?.filter(patient => {
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = patient.name?.toLowerCase().includes(searchLower) || false;
      const emailMatch = patient.email?.toLowerCase().includes(searchLower) || false;
      
      return nameMatch || emailMatch;
    });
    
    return (
      <div className="container">
        {/* Change the name to say hello, NAME */}
        <h2 className="mt-8 text-6xl font-bold mb-8 tracking-tight">
          <span className="text-[#001F54]">Hello, </span>
          <span className="text-[#21A3DB]">Caregiver</span>
        </h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <h3 className="text-lg font-medium">Patients with Forms</h3>
            
            <div className="flex-1 flex items-center justify-end gap-4">
              <Tabs 
                value={appointmentFilter} 
                onValueChange={(value) => setAppointmentFilter(value as "all" | "with_appointments" | "without_appointments")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="with_appointments">With Appt</TabsTrigger>
                  <TabsTrigger value="without_appointments">Needs Appt</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {patientFormsByStatus === undefined ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : patientFormsByStatus.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <Card className="p-8">
                <CardTitle className="mb-2">No matching patients found</CardTitle>
                <CardDescription>
                  {appointmentFilter === "with_appointments" 
                    ? "There are no patients with forms who have appointments." 
                    : appointmentFilter === "without_appointments"
                    ? "All patients with forms have appointments scheduled."
                    : "There are no patient forms submitted yet."}
                </CardDescription>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientFormsByStatus
                .filter((form): form is NonNullable<typeof form> => form !== null)
                .map((form) => (
                <Card key={form._id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {form.name ? form.name.charAt(0).toUpperCase() : form.patient?.name ? form.patient.name.charAt(0).toUpperCase() : "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{form.name || form.patient?.name || "Anonymous Patient"}</CardTitle>
                          <CardDescription className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(form.submittedAt)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {form.priorityScore.toFixed(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="mb-2">
                      <div className="text-sm font-medium mb-1">Symptoms:</div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{form.symptoms}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Severity:</span>
                        {getSeverityBadge(form.severity)}
                      </div>
                      {form.hasAppointments ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Has Appointment
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                          <CalendarX className="h-3 w-3" />
                          No Appointment
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {form.hasAppointments ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/protected/patients/${form.patient?._id}`)}
                      >
                        View Patient Details
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/protected/appointments/new?patient=${form.patient?._id}`)}
                      >
                        Schedule Appointment
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-12 mb-4">
            <h3 className="text-lg font-medium mb-4">All Patients</h3>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {allPatients === undefined ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPatients?.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <Card className="p-8">
                  <CardTitle className="mb-2">No patients found</CardTitle>
                  <CardDescription>
                    {searchQuery 
                      ? "No patients match your search criteria." 
                      : "There are no patients registered in the system."}
                  </CardDescription>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPatients?.map((patient) => (
                  <Card 
                    key={patient._id} 
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/protected/patients/${patient._id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {patient.latestForm?.name ? patient.latestForm.name.charAt(0).toUpperCase() : patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{patient.latestForm?.name || patient.name || "Unnamed Patient"}</CardTitle>
                          <CardDescription className="text-xs truncate max-w-[180px]">
                            {patient.email || "No email provided"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                      >
                        View Patient
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  } 
  // END OF CAREGIVER

  /////////////////////////////////////////////////////////
  //                  PATIENT DASHBOARD!!                //
  /////////////////////////////////////////////////////////
  return (
    <div className="container">
      {/* Change the name to say hello, NAME */}
      {/* <h2 className="mt-8 text-4xl font-bold mb-6 tracking-tight">Hello, Patient</h2> */}
      <h2 className="mt-8 text-6xl font-bold mb-8 tracking-tight">
        <span className="text-[#001F54]">Hello, </span>
        <span className="text-[#21A3DB]">Patient</span>
      </h2>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Health Forms Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Health Forms
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {patientOwnForms?.length || 0}
              </Badge>
            </div>
            <CardDescription>
              Submit and manage your health information
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {patientOwnForms === undefined ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : patientOwnForms.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No forms submitted yet
              </div>
            ) : (
              <div className="space-y-2">
                {patientOwnForms.slice(0, 3).map((form) => (
                  <div key={form._id} className="flex items-center justify-between p-2 rounded-md border">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate max-w-[150px]">
                        {form.symptoms.substring(0, 30)}...
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(form.submittedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getSeverityBadge(form.severity)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/protected/forms")}
            >
              View All
            </Button>
            <Button 
              size="sm"
              onClick={() => router.push("/protected/forms/new")}
              className="gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              New Form
            </Button>
          </CardFooter>
        </Card>

        {/* Appointments Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Appointments
              </CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {patientAppointments?.length || 0}
              </Badge>
            </div>
            <CardDescription>
              View and manage your scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {patientAppointments === undefined ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : patientAppointments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No appointments scheduled
              </div>
            ) : (
              <div className="space-y-2">
                {patientAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-2 rounded-md border hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/protected/appointments/${appointment._id}`)}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {new Date(appointment.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {appointment.caregiver?.name || "Unknown Provider"}
                        {appointment.caregiver?.specialty && (
                          <span className="text-xs text-muted-foreground block">
                            {appointment.caregiver.specialty}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className={
                        appointment.date > Date.now() 
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }>
                        {appointment.date > Date.now() ? "Upcoming" : "Completed"}
                      </Badge>
                      {appointment.date > Date.now() && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/protected/appointments/${appointment._id}`);
                          }}
                        >
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/protected/appointments")}
              className="w-full"
            >
              View All Appointments
            </Button>
          </CardFooter>
        </Card>

        {/* Prescriptions Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-500" />
                Prescriptions
              </CardTitle>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {patientPrescriptions?.length || 0}
              </Badge>
            </div>
            <CardDescription>
              Manage your medications and refills
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {patientPrescriptions === undefined ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : patientPrescriptions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No prescriptions available
              </div>
            ) : (
              <div className="space-y-2">
                {patientPrescriptions.slice(0, 3).map((prescription) => (
                  <div key={prescription._id} className="flex items-center justify-between p-2 rounded-md border">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {prescription.medicationName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {prescription.dosage}
                      </span>
                    </div>
                    <Badge variant="outline" className={
                      prescription.refillsRemaining > 0
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }>
                      {prescription.refillsRemaining > 0 
                        ? `${prescription.refillsRemaining} refills` 
                        : "No refills"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/protected/prescriptions")}
              className="w-full"
            >
              View All Prescriptions
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}