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
import { Edit, Trash2, Plus, FileText, Loader2 } from "lucide-react"

export default function FormsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const forms = useQuery(api.forms.getPatientForms)
  const deleteForm = useMutation(api.forms.deleteForm)
  const [formToDelete, setFormToDelete] = useState<Id<"forms"> | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!user || user.role !== ROLES.PATIENT) {
    router.push("/protected")
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!formToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteForm({ formId: formToDelete })
      toast.success("Form deleted successfully")
    } catch (error) {
      console.error("Error deleting form:", error)
      toast.error("Failed to delete form")
    } finally {
      setIsDeleting(false)
      setFormToDelete(null)
    }
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Your Health Forms</h2>
        {forms && forms.length > 0 && (
          <Button onClick={() => router.push("/protected/forms/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Form
          </Button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {forms === undefined ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : forms.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No forms submitted yet</CardTitle>
              <CardDescription>
                Submit your first health information form to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push("/protected/forms/new")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submitted Forms</CardTitle>
              <CardDescription>
                View and manage your submitted health information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Priority Score</TableHead>
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
                        {form.priorityScore.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/protected/forms/${form._id}`)}
                            title="View Details"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/protected/forms/${form._id}`)}
                            title="Edit Form"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={formToDelete === form._id} onOpenChange={(open) => !open && setFormToDelete(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setFormToDelete(form._id)}
                                title="Delete Form"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your
                                  health information form.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleDelete()
                                  }}
                                  disabled={isDeleting}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  {isDeleting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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