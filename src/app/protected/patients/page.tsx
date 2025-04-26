"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Calendar, 
  Clock, 
  FileText, 
  Loader2, 
  Search, 
  User, 
  AlertTriangle,
  Filter,
  ChevronDown
} from "lucide-react"

export default function PatientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOption, setFilterOption] = useState<"all" | "withForms">("all")
  
  useEffect(() => {
    const filter = searchParams.get("filter")
    if (filter === "withForms") {
      setFilterOption("withForms")
    }
  }, [searchParams])
  
  const patients = useQuery(api.users.getAllPatients)
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!user || user.role !== ROLES.CAREGIVER) {
    router.push("/protected")
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    )
  }
  
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "No date"
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
        return null
    }
  }
  
  const filteredPatients = patients?.filter(patient => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const nameMatch = patient.name?.toLowerCase().includes(searchLower) || false
      const emailMatch = patient.email?.toLowerCase().includes(searchLower) || false
      
      if (!nameMatch && !emailMatch) return false
    }
    
    if (filterOption === "withForms") {
      return !!patient.latestForm
    }
    
    return true
  })
  
  const sortedPatients = filteredPatients?.sort((a, b) => {
    if (a.latestForm && !b.latestForm) return -1
    if (!a.latestForm && b.latestForm) return 1
    
    if (a.latestForm && b.latestForm) {
      return b.latestForm.priorityScore - a.latestForm.priorityScore
    }
    
    return (a.name || "").localeCompare(b.name || "")
  })
  
  return (
    <div className="container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">All Patients</h2>
        
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 whitespace-nowrap">
                <Filter className="h-4 w-4" />
                {filterOption === "all" ? "All Patients" : "With Forms"}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => {
                  setFilterOption("all")
                  router.push("/protected/patients")
                }}
                className="cursor-pointer"
              >
                All Patients
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setFilterOption("withForms")
                  router.push("/protected/patients?filter=withForms")
                }}
                className="cursor-pointer"
              >
                Patients with Forms
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {patients === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : patients.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No patients found</CardTitle>
              <CardDescription>
                There are no patients registered in the system yet.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : sortedPatients?.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No matching patients</CardTitle>
              <CardDescription>
                {filterOption === "withForms" 
                  ? "No patients with submitted forms match your criteria." 
                  : "No patients match your search criteria."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2">
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
              {filterOption === "withForms" && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilterOption("all")
                    router.push("/protected/patients")
                  }}
                >
                  Show All Patients
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPatients?.map((patient) => (
              <Card 
                key={patient._id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/protected/patients/${patient._id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={patient.image} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {patient.latestForm?.name ? patient.latestForm.name.charAt(0).toUpperCase() : patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{patient.latestForm?.name || patient.name || "Anonymous Patient"}</CardTitle>
                        <CardDescription className="text-xs truncate max-w-[180px]">
                          {patient.email || "No email provided"}
                        </CardDescription>
                      </div>
                    </div>
                    {patient.latestForm && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {patient.latestForm.priorityScore.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {patient.latestForm ? (
                    <>
                      <div className="mb-2">
                        <div className="text-sm font-medium mb-1">Latest Form:</div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {patient.latestForm.symptoms}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Severity:</span>
                          {getSeverityBadge(patient.latestForm.severity)}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(patient.latestForm.submittedAt)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-4 text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">No health forms submitted</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/protected/patients/${patient._id}`)
                    }}
                  >
                    View Patient Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}