"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Clock, FileText, MessageSquare, Send, AlertTriangle, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ROLES, SEVERITY } from "@/convex/schema"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"

// Get severity badge color
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case SEVERITY.MILD:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case SEVERITY.MODERATE:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case SEVERITY.SEVERE:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

// Get priority score badge color
const getPriorityColor = (score: number) => {
  if (score >= 4) {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  } else if (score >= 2.5) {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  } else {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }
}

export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeFormId, setActiveFormId] = useState<Id<"patientForms"> | null>(null)
  const [noteText, setNoteText] = useState("")
  const [recommendationText, setRecommendationText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("forms")
  
  // Convert string ID to Convex ID
  const patientId = params.patientId as Id<"users">
  
  // Fetch patient data
  const patient = useQuery(api.users.getUserById, { userId: patientId })
  
  // Fetch patient forms
  const forms = useQuery(api.patientForms.getFormsByPatientId, { patientId })
  
  // Fetch notes for the active form
  const notes = useQuery(
    api.caregivers.getFormNotes, 
    activeFormId ? { formId: activeFormId } : "skip"
  )
  
  // Fetch recommendations for the patient
  const recommendations = useQuery(api.caregivers.getPatientRecommendations, { patientId })
  
  // Mutations
  const addNote = useMutation(api.caregivers.addNote)
  const createRecommendation = useMutation(api.caregivers.createRecommendation)
  
  // Set the first form as active when forms are loaded
  useEffect(() => {
    if (forms && forms.length > 0 && !activeFormId) {
      setActiveFormId(forms[0]._id)
    }
  }, [forms, activeFormId])
  
  // Redirect if user is not a caregiver
  useEffect(() => {
    if (!authLoading && user && user.role !== ROLES.CAREGIVER) {
      toast("Access Denied", {
        description: "You don't have permission to access patient details",
      })
      router.push("/protected/caregiver")
    }
  }, [user, authLoading, router])
  
  // Handle note submission
  const handleNoteSubmit = async () => {
    if (!activeFormId || !noteText.trim()) return
    
    setIsSubmitting(true)
    
    try {
      await addNote({
        formId: activeFormId,
        noteText: noteText.trim()
      })
      
      toast.success("Note added successfully")
      setNoteText("")
    } catch (error) {
      toast.error("Failed to add note")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle recommendation submission
  const handleRecommendationSubmit = async () => {
    if (!activeFormId || !recommendationText.trim()) return
    
    setIsSubmitting(true)
    
    try {
      await createRecommendation({
        formId: activeFormId,
        patientId,
        recommendationText: recommendationText.trim()
      })
      
      toast.success("Recommendation created successfully")
      setRecommendationText("")
    } catch (error) {
      toast.error("Failed to create recommendation")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Show loading state while checking authentication
  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  // Show access denied if user is not a caregiver
  if (user.role !== ROLES.CAREGIVER) {
    return (
      <div className="container max-w-5xl">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access patient details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please contact an administrator if you believe this is an error.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Show loading state while fetching patient data
  if (!patient || !forms) {
    return (
      <div className="container max-w-5xl">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/protected/caregiver")}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient List
          </Button>
        </div>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }
  
  // Get active form
  const activeForm = forms.find(form => form._id === activeFormId) || null
  
  return (
    <div className="container max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/protected/caregiver")}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient List
          </Button>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 tracking-tight">
          Patient: {patient.name || patient.email || "Unnamed Patient"}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>
                Personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-lg font-medium">{patient.name || "Not provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-base">{patient.email || "Not provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Submissions</h3>
                <p className="text-base">{forms.length} form(s)</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Latest Submission</h3>
                {forms.length > 0 ? (
                  <p className="text-base">
                    {formatDistanceToNow(new Date(forms[0].submissionDate), { addSuffix: true })}
                  </p>
                ) : (
                  <p className="text-base text-muted-foreground">No submissions yet</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Forms and Details */}
          <div className="lg:col-span-2 space-y-6">
            {forms.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">This patient has not submitted any forms yet.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Tabs for different sections */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="forms" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Forms
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="recommendations" className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Recommendations
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Forms Tab */}
                  <TabsContent value="forms">
                    <Card>
                      <CardHeader>
                        <CardTitle>Patient Forms</CardTitle>
                        <CardDescription>
                          Select a form to view details and add notes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {forms.map(form => (
                            <Card 
                              key={form._id} 
                              className={`cursor-pointer hover:border-primary/50 transition-colors ${
                                activeFormId === form._id ? 'border-primary' : ''
                              }`}
                              onClick={() => setActiveFormId(form._id)}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-sm">Form Submission</CardTitle>
                                  <Badge variant="outline" className={`${
                                    form.status === "pending" 
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  }`}>
                                    {form.status === "pending" ? "Pending" : "Reviewed"}
                                  </Badge>
                                </div>
                                <CardDescription className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(form.submissionDate), { addSuffix: true })}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium">Priority:</span>
                                  <Badge className={getPriorityColor(form.priorityScore)}>
                                    {form.priorityScore.toFixed(1)}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">Severity:</span>
                                  <Badge className={getSeverityColor(form.severity)}>
                                    {form.severity}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        {activeForm && (
                          <div className="space-y-4">
                            <Separator />
                            <div>
                              <h3 className="text-lg font-medium mb-2">Form Details</h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Symptoms</h4>
                                  <p className="text-base mt-1">{activeForm.symptoms}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Severity</h4>
                                    <Badge className={`mt-1 ${getSeverityColor(activeForm.severity)}`}>
                                      {activeForm.severity}
                                    </Badge>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Priority Score</h4>
                                    <Badge className={`mt-1 ${getPriorityColor(activeForm.priorityScore)}`}>
                                      {activeForm.priorityScore.toFixed(1)}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                                  <p className="text-base mt-1">{activeForm.contactInfo}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Submission Date</h4>
                                  <p className="text-base mt-1">
                                    {format(new Date(activeForm.submissionDate), "PPP 'at' p")}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h3 className="text-lg font-medium mb-2">Add Note</h3>
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="Enter your notes about this patient's condition..."
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  className="min-h-[100px]"
                                  disabled={isSubmitting}
                                />
                                <Button 
                                  onClick={handleNoteSubmit} 
                                  disabled={!noteText.trim() || isSubmitting}
                                  className="flex items-center gap-2"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare className="h-4 w-4" />
                                      Add Note
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h3 className="text-lg font-medium mb-2">Create Recommendation</h3>
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="Enter your recommendation for this patient..."
                                  value={recommendationText}
                                  onChange={(e) => setRecommendationText(e.target.value)}
                                  className="min-h-[100px]"
                                  disabled={isSubmitting}
                                />
                                <Button 
                                  onClick={handleRecommendationSubmit} 
                                  disabled={!recommendationText.trim() || isSubmitting}
                                  className="flex items-center gap-2"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4" />
                                      Create Recommendation
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Notes Tab */}
                  <TabsContent value="notes">
                    <Card>
                      <CardHeader>
                        <CardTitle>Caregiver Notes</CardTitle>
                        <CardDescription>
                          Notes added by caregivers for this patient
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {!activeFormId ? (
                          <p className="text-center text-muted-foreground py-4">
                            Select a form to view notes
                          </p>
                        ) : notes === undefined ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : notes.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            No notes have been added for this form
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {notes.map(note => (
                              <Card key={note._id}>
                                <CardHeader className="pb-2">
                                  <CardDescription>
                                    {formatDistanceToNow(new Date(note.dateAdded), { addSuffix: true })}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <p>{note.noteText}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Recommendations Tab */}
                  <TabsContent value="recommendations">
                    <Card>
                      <CardHeader>
                        <CardTitle>Patient Recommendations</CardTitle>
                        <CardDescription>
                          Recommendations created for this patient
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {recommendations === undefined ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : recommendations.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            No recommendations have been created for this patient
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {recommendations.map(recommendation => (
                              <Card key={recommendation._id}>
                                <CardHeader className="pb-2">
                                  <CardDescription>
                                    Created {formatDistanceToNow(new Date(recommendation.dateGenerated), { addSuffix: true })}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <p>{recommendation.recommendationText}</p>
                                </CardContent>
                                <CardFooter>
                                  <Badge variant="outline" className={recommendation.emailSent ? 
                                    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : 
                                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  }>
                                    {recommendation.emailSent ? "Email Sent" : "Email Pending"}
                                  </Badge>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}