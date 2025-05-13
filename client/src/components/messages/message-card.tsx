import React from "react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface MessageCardProps {
  message: {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender?: {
      username: string;
      avatar?: string | null;
    };
  };
}

export function MessageCard({ message }: MessageCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Check if message is from current user
  const isFromCurrentUser = user?.id === message.senderId;

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ru 
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={`flex items-start gap-2 mb-4 ${isFromCurrentUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={message.sender?.avatar || undefined} />
        <AvatarFallback className="bg-primary-100 text-primary-700">
          {message.sender?.username.slice(0, 2).toUpperCase() || "AN"}
        </AvatarFallback>
      </Avatar>
      
      <div className={`max-w-[80%] ${isFromCurrentUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`relative px-3 py-2 rounded-2xl shadow-sm ${
            isFromCurrentUser 
              ? 'bg-primary-100 text-primary-900 rounded-tr-none' 
              : 'bg-neutral-100 text-neutral-900 rounded-tl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-line">{message.content}</p>
        </div>
        
        <div className={`flex mt-1 text-xs text-muted-foreground ${isFromCurrentUser ? 'justify-end' : ''}`}>
          <time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time>
          {!message.isRead && isFromCurrentUser && (
            <span className="ml-2 font-medium text-primary-600">{t('messages.sent')}</span>
          )}
        </div>
      </div>
    </div>
  );
}