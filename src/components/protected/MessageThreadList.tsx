"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MessageSquare, User } from "lucide-react"

interface MessageThreadListProps {
  onSelectThread: (userId: Id<"users">) => void
  selectedUserId?: Id<"users">
}

export function MessageThreadList({ onSelectThread, selectedUserId }: MessageThreadListProps) {
  const threads = useQuery(api.messages.getMessageThreads)
  
  // Format the timestamp to a relative time (e.g., "2 hours ago")
  const formatMessageTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }
  
  // Get the initials for the avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  // Truncate long message previews
  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  if (threads === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No messages</CardTitle>
          <CardDescription>
            You don't have any message threads yet
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            When you start a conversation with a healthcare provider or patient, it will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-1">
      {threads.map((thread) => (
        <motion.div
          key={thread.partner?._id}
          whileHover={{ x: 2 }}
          className={`p-3 rounded-md cursor-pointer transition-colors ${
            selectedUserId === thread.partner?._id
              ? "bg-accent"
              : "hover:bg-accent/50"
          }`}
          onClick={() => thread.partner && onSelectThread(thread.partner._id)}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={thread.partner?.image} />
              <AvatarFallback>
                {thread.partner?.name ? getInitials(thread.partner.name) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">
                  {thread.partner?.name || "Unknown User"}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatMessageTime(thread.lastMessage.sentAt)}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground truncate">
                  {truncateMessage(thread.lastMessage.content)}
                </p>
                
                {thread.unreadCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {thread.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}