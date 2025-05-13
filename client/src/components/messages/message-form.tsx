import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageFormProps {
  senderId: number;
  receiverId: number;
  conversationId: string;
}

export function MessageForm({ senderId, receiverId, conversationId }: MessageFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async (data: { senderId: number; receiverId: number; content: string }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      // Invalidate conversation to refresh messages
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${conversationId}`] });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: t('messages.sendError'),
        description: error instanceof Error ? error.message : t('messages.generalError'),
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    sendMessage.mutate({
      senderId,
      receiverId,
      content: content.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-end">
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('messages.placeholder')}
          className="min-h-[80px] resize-none"
          disabled={isSubmitting}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!content.trim() || isSubmitting}
        className="h-10"
      >
        <Send className="h-4 w-4 mr-2" />
        {t('messages.send')}
      </Button>
    </form>
  );
}