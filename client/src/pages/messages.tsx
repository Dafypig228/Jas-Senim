import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { MessageCard } from "@/components/messages/message-card";
import { MessageForm } from "@/components/messages/message-form";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const { t } = useTranslation();
  const params = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get conversation ID from URL
  const conversationId = params.conversationId;
  
  // Parse user IDs from conversation ID (format: "user1-user2")
  const [userId1, userId2] = conversationId ? conversationId.split('-').map(Number) : [0, 0];
  
  // Determine the other user's ID
  const otherUserId = user?.id === userId1 ? userId2 : userId1;
  
  // Fetch messages
  const { data: messages = [], isLoading, isError } = useQuery<any[]>({
    queryKey: [`/api/messages/${conversationId}`],
    enabled: !!conversationId && !!user,
  });
  
  // Fetch other user's info
  const { data: otherUser = {}, isLoading: isLoadingUser } = useQuery<any>({
    queryKey: [`/api/users/${otherUserId}`],
    enabled: !!otherUserId,
  });
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p>{t('messages.pleaseLogin')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!conversationId) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('messages.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('messages.selectConversation')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('common.back')}
            </Button>
            
            {isLoadingUser ? (
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-2">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src={otherUser.avatar || undefined} />
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {(otherUser.username ? otherUser.username.slice(0, 2).toUpperCase() : "UN")}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <CardTitle className="text-lg">{otherUser.username || t('user.anonymous')}</CardTitle>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-16 w-64 rounded-2xl" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </div>
              </div>
              
              <div className="flex items-start gap-2 flex-row-reverse">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-12 w-48 rounded-2xl" />
                  <div className="flex justify-end mt-1">
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ) : isError ? (
            <p className="text-center py-4 text-destructive">{t('messages.loadError')}</p>
          ) : messages && messages.length > 0 ? (
            <div className="py-4">
              {messages.map((message: any) => (
                <MessageCard key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('messages.noMessages')}</p>
              <CardDescription className="mt-2">{t('messages.startConversation')}</CardDescription>
            </div>
          )}
          
          {user && otherUserId && (
            <MessageForm 
              senderId={user.id} 
              receiverId={otherUserId}
              conversationId={conversationId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}