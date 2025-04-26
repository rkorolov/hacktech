"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, Loader2, User, Pill, RefreshCw, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function PrescriptionsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [isRefilling, setIsRefilling] = useState(false)
  const [refillPrescriptionId, setRefillPrescriptionId] = useState<Id<"prescriptions"> | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"users"> | null>(null)

  const patientPrescriptions = useQuery(
    api.prescriptions.getPatientPrescriptions,
    user?.role === ROLES.PATIENT ? {} : "skip"
  )
  
  const caregiverPrescriptions = useQuery(
    api.prescriptions.getCaregiverPrescriptions,
    user?.role === ROLES.CAREGIVER ? { patientId: selectedPatientId || undefined } : "skip"
  )
  
  const patients = useQuery(
    api.users.getAllPatients,
    user?.role === ROLES.CAREGIVER ? {} : "skip"
  )

  const requestRefill = useMutation(api.prescriptions.requestRefill)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const handleRequestRefill = async () => {
    if (!refillPrescriptionId) return
    
    setIsRefilling(true)
    try {
      await requestRefill({ prescriptionId: refillPrescriptionId })
      toast.success("Refill requested successfully")
      setRefillPrescriptionId(null)
    } catch (error) {
      console.error("Error requesting refill:", error)
      toast.error(error instanceof Error ? error.message : "Failed to request refill")
    } finally {
      setIsRefilling(false)
    }
  }

  if (user?.role === ROLES.PATIENT) {
    const prescriptions = patientPrescriptions

    return (
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Your Prescriptions</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {prescriptions === undefined ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : prescriptions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No prescriptions</CardTitle>
                <CardDescription>
                  You don't have any prescriptions at this time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your healthcare provider will prescribe medications as needed after your appointments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Current Prescriptions</CardTitle>
                <CardDescription>
                  View your medications and request refills
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                            <Pill className="h-4 w-4 text-blue-500" />
                            {prescription.medicationName}
                          </div>
                        </TableCell>
                        <TableCell>{prescription.dosage}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {prescription.prescriber?.name || "Unknown Provider"}
                              {prescription.prescriber?.specialty && (
                                <span className="text-muted-foreground text-sm block">
                                  {prescription.prescriber.specialty}
                                </span>
                              )}
                            </span>
                          </div>
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
                          <div className="flex justify-end gap-2">
                            <Dialog onOpenChange={(open) => {
                              if (open) setSelectedPrescription(prescription)
                              else setSelectedPrescription(null)
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                >
                                  <FileText className="h-4 w-4" />
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>{selectedPrescription?.medicationName}</DialogTitle>
                                  <DialogDescription>
                                    Prescribed on {selectedPrescription && formatDate(selectedPrescription.prescribedAt)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Dosage</h4>
                                    <p className="text-sm">{selectedPrescription?.dosage}</p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Prescribed By</h4>
                                    <p className="text-sm">
                                      {selectedPrescription?.prescriber?.name || "Unknown Provider"}
                                      {selectedPrescription?.prescriber?.specialty && (
                                        <span className="text-muted-foreground block">
                                          {selectedPrescription.prescriber.specialty}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Refills</h4>
                                    <p className="text-sm">
                                      {selectedPrescription?.refillsRemaining > 0 
                                        ? `${selectedPrescription?.refillsRemaining} refills remaining` 
                                        : "No refills remaining"}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {prescription.refillsRemaining > 0 && (
                              <AlertDialog 
                                open={refillPrescriptionId === prescription._id} 
                                onOpenChange={(open) => !open && setRefillPrescriptionId(null)}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                    onClick={() => setRefillPrescriptionId(prescription._id)}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                    Refill
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Request Medication Refill</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to request a refill for {prescription.medicationName}?
                                      This will use one of your remaining refills.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isRefilling}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleRequestRefill()
                                      }}
                                      disabled={isRefilling}
                                    >
                                      {isRefilling ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        "Request Refill"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    )
  }
  
  if (user?.role === ROLES.CAREGIVER) {
    const filteredPatients = patients?.filter(patient => {
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = patient.name?.toLowerCase().includes(searchLower) || false;
      const emailMatch = patient.email?.toLowerCase().includes(searchLower) || false;
      
      return nameMatch || emailMatch;
    });
    
    return (
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Prescriptions</h2>
          <Button 
            onClick={() => router.push("/protected/prescriptions/new")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Prescription
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Patients</CardTitle>
                <CardDescription>
                  Select a patient to view prescriptions
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {filteredPatients === undefined ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <p className="text-center text-muted-foreground">No patients found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredPatients.map((patient) => (
                      <div 
                        key={patient._id} 
                        className={`p-2 rounded-md border cursor-pointer hover:bg-muted/50 ${
                          selectedPatientId === patient._id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedPatientId(patient._id)}
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{patient.name || "Unnamed Patient"}</p>
                            <p className="text-xs text-muted-foreground truncate">{patient.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>
                  {selectedPatientId 
                    ? `Prescriptions for ${patients?.find(p => p._id === selectedPatientId)?.name || 'Patient'}`
                    : 'Select a patient to view prescriptions'}
                </CardTitle>
                <CardDescription>
                  Manage patient prescriptions and refills
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPatientId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a patient from the list to view their prescriptions
                  </div>
                ) : caregiverPrescriptions === undefined ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : caregiverPrescriptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">No prescriptions for this patient</p>
                    <Button 
                      onClick={() => router.push(`/protected/prescriptions/new?patient=${selectedPatientId}`)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Prescription
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Prescribed On</TableHead>
                        <TableHead>Refills</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caregiverPrescriptions.map((prescription) => (
                        <TableRow key={prescription._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-purple-500" />
                              {prescription.medicationName}
                            </div>
                          </TableCell>
                          <TableCell>{prescription.dosage}</TableCell>
                          <TableCell>{formatDate(prescription.prescribedAt)}</TableCell>
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
          </div>
        </motion.div>
      </div>
    )
  }
  
  router.push("/protected")
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Redirecting...</span>
    </div>
  )
}