"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, ArrowUpDown, Clock, AlertTriangle, CheckCircle2, Filter } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { SEVERITY } from "@/convex/schema"
import { motion } from "framer-motion"
import Link from "next/link"

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

export function PatientList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("priority")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search input to avoid too many queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch patients with search and sort parameters
  const patients = useQuery(api.caregivers.getPatients, {
    searchQuery: debouncedSearch,
    sortBy: sortBy as "priority" | "recent" | "name"
  })

  // Filter patients by form status if needed
  const filteredPatients = patients?.filter(patient => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") return patient.latestForm?.status === "pending";
    if (statusFilter === "reviewed") return patient.latestForm?.status === "reviewed";
    if (statusFilter === "noforms") return !patient.latestForm;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="noforms">No Forms</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority (Highest)</SelectItem>
              <SelectItem value="recent">Recent Submissions</SelectItem>
              <SelectItem value="name">Patient Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {patients === undefined ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPatients?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No patients found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients?.map((patient) => (
            <motion.div
              key={patient._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/protected/caregiver/patient/${patient._id}`} className="block">
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{patient.name || "Unnamed Patient"}</CardTitle>
                      {patient.latestForm ? (
                        <Badge variant="outline" className={`${
                          patient.latestForm.status === "pending" 
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        }`}>
                          {patient.latestForm.status === "pending" ? "Pending" : "Reviewed"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          No Forms
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{patient.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patient.latestForm ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Priority Score:</span>
                          <Badge className={getPriorityColor(patient.latestForm.priorityScore)}>
                            {patient.latestForm.priorityScore.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Severity:</span>
                          <Badge className={getSeverityColor(patient.latestForm.severity)}>
                            {patient.latestForm.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Submitted:</span>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(patient.latestForm.submissionDate), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <AlertTriangle className="h-5 w-5 mb-1" />
                          <span className="text-sm">No information submitted</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full">
                      {patient.latestForm?.status === "pending" ? (
                        <>Review Patient</>
                      ) : (
                        <>View Details</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}