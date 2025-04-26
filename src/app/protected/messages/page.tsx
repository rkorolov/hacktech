"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/convex/schema"
import { formatRelative } from "date-fns"
import { motion } from "framer-motion"

import { MessageThreadList } from "@/components/protected/MessageThreadList"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2, MessageSquare, Send, User } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function MessagesPage() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null)
  const [messageContent, setMessageContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showThreadList, setShowThreadList] = useState(!isMobile)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const messages = useQuery(
    api.messages.getMessages,
    selectedUserId ? { otherUserId: selectedUserId } : "skip"
  )
  const sendMessage = useMutation(api.messages.sendMessage)
  const markAsRead = useMutation(api.messages.markAsRead)
  
  const selectedUser = useQuery(
    api.users.currentUser,
    selectedUserId ? {} : "skip"
  )
  
  const handleSelectThread = (userId: Id<"users">) => {
    setSelectedUserId(userId)
    if (isMobile) {
      setShowThreadList(false)
    }
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUserId || !messageContent.trim()) return
    
    setIsSending(true)
    try {
      await sendMessage({
        toId: selectedUserId,
        content: messageContent.trim(),
      })
      setMessageContent("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }
  
  useEffect(() => {
    if (!messages || !selectedUserId) return
    
    const unreadMessageIds = messages
      .filter(msg => msg.toId === user?._id && !msg.read)
      .map(msg => msg._id)
    
    if (unreadMessageIds.length > 0) {
      markAsRead({ messageIds: unreadMessageIds }).catch(console.error)
    }
  }, [messages, selectedUserId, user?._id, markAsRead])
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])
  
  const formatMessageTime = (timestamp: number) => {
    return formatRelative(new Date(timestamp), new Date())
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  const toggleView = () => {
    setShowThreadList(!showThreadList)
  }
  
  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        {isMobile && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleView}
          >
            {showThreadList ? "View Conversation" : "Back to Threads"}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(!isMobile || showThreadList) && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-1"
          >
            <Card className="h-[calc(80vh-120px)]">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>
                  Your message threads with healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-y-auto h-full pb-4">
                <MessageThreadList 
                  onSelectThread={handleSelectThread}
                  selectedUserId={selectedUserId || undefined}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {(!isMobile || !showThreadList) && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2"
          >
            <Card className="h-[calc(80vh-120px)] flex flex-col">
              {selectedUserId ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedUser?.image} />
                        <AvatarFallback>
                          {selectedUser?.name ? getInitials(selectedUser.name) : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{selectedUser?.name || "Loading..."}</CardTitle>
                        <CardDescription>
                          {selectedUser?.role === ROLES.CAREGIVER ? "Healthcare Provider" : "Patient"}
                          {selectedUser?.specialty && ` • ${selectedUser.specialty}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <Separator />
                  
                  <CardContent className="flex-1 overflow-y-auto py-4">
                    {messages === undefined ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">
                          No messages yet. Start the conversation by sending a message below.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isCurrentUser = message.fromId === user?._id
                          
                          return (
                            <div 
                              key={message._id} 
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isCurrentUser && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={message.from?.image} />
                                    <AvatarFallback>
                                      {message.from?.name ? getInitials(message.from.name) : <User className="h-3 w-3" />}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div>
                                  <div 
                                    className={`px-4 py-2 rounded-lg ${
                                      isCurrentUser 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  </div>
                                  <p className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                                    {formatMessageTime(message.sentAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-3">
                    <form onSubmit={handleSendMessage} className="w-full">
                      <div className="flex gap-2">
                        <Textarea
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 min-h-[60px] max-h-[120px]"
                          disabled={isSending}
                        />
                        <Button 
                          type="submit" 
                          size="icon" 
                          className="h-[60px] w-[60px]"
                          disabled={!messageContent.trim() || isSending}
                        >
                          {isSending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardFooter>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                  <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a conversation from the list to view messages or start a new conversation.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}