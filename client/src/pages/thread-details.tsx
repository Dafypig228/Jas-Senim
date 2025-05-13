import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ThreadCard } from "@/components/threads/thread-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  Send, 
  HeartHandshake, 
  Heart, 
  Shield, 
  Lightbulb 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

export default function ThreadDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const threadId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  // Thread details query
  const { data: thread, isLoading: isLoadingThread } = useQuery({
    queryKey: [`/api/threads/${threadId}`],
    queryFn: async () => {
      const response = await fetch(`/api/threads/${threadId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch thread details');
      }
      return response.json();
    },
    enabled: !!threadId && !isNaN(threadId),
  });

  // Comments query
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/threads/${threadId}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/threads/${threadId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
    enabled: !!threadId && !isNaN(threadId),
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string }) => {
      return await apiRequest('POST', `/api/threads/${threadId}/comments`, commentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}/comments`] });
      setComment("");
      toast({
        title: t('comments.added'),
        description: t('comments.addedDesc'),
      });
    },
    onError: () => {
      toast({
        title: t('comments.error'),
        description: t('comments.errorDesc'),
        variant: "destructive",
      });
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (reactionData: { type: string }) => {
      return await apiRequest('POST', `/api/threads/${threadId}/reactions`, reactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}`] });
      toast({
        title: t('reactions.added'),
        description: t('reactions.addedDesc'),
      });
    },
    onError: () => {
      toast({
        title: t('reactions.error'),
        description: t('reactions.errorDesc'),
        variant: "destructive",
      });
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: async (reactionData: { type: string }) => {
      return await apiRequest('DELETE', `/api/threads/${threadId}/reactions`, reactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}`] });
      setSelectedReaction(null);
    },
    onError: () => {
      toast({
        title: t('reactions.removeError'),
        description: t('reactions.removeErrorDesc'),
        variant: "destructive",
      });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addCommentMutation.mutate({ content: comment });
  };

  const handleReactionClick = (type: string) => {
    if (selectedReaction === type) {
      removeReactionMutation.mutate({ type });
    } else {
      if (selectedReaction) {
        removeReactionMutation.mutate({ type: selectedReaction });
      }
      addReactionMutation.mutate({ type });
      setSelectedReaction(type);
    }
  };

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

  if (isLoadingThread) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{t('thread.notFound')}</p>
            <Button asChild className="mt-4 mx-auto block">
              <Link to="/threads">{t('thread.backToThreads')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/threads" className="flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('thread.backToList')}
          </Link>
        </Button>
      </div>

      {/* Thread content */}
      <ThreadCard thread={thread} />

      {/* Reactions section */}
      <Card className="mt-4 bg-neutral-50 border border-neutral-100">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">{t('thread.howDoYouFeel')}</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedReaction === "understand" ? "default" : "outline"} 
              size="sm" 
              className="flex items-center"
              onClick={() => handleReactionClick("understand")}
            >
              <HeartHandshake className="h-4 w-4 mr-1 text-pink-600" />
              {t('reactions.understand')}
            </Button>
            <Button 
              variant={selectedReaction === "not_alone" ? "default" : "outline"} 
              size="sm" 
              className="flex items-center"
              onClick={() => handleReactionClick("not_alone")}
            >
              <Shield className="h-4 w-4 mr-1 text-purple-600" />
              {t('reactions.notAlone')}
            </Button>
            <Button 
              variant={selectedReaction === "will_overcome" ? "default" : "outline"} 
              size="sm" 
              className="flex items-center"
              onClick={() => handleReactionClick("will_overcome")}
            >
              <Heart className="h-4 w-4 mr-1 text-red-600" />
              {t('reactions.willOvercome')}
            </Button>
            <Button 
              variant={selectedReaction === "idea" ? "default" : "outline"} 
              size="sm" 
              className="flex items-center"
              onClick={() => handleReactionClick("idea")}
            >
              <Lightbulb className="h-4 w-4 mr-1 text-amber-600" />
              {t('reactions.idea')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments section */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('comments.title')} ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <Textarea 
                placeholder={t('comments.placeholder')}
                className="mb-2"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button 
                type="submit" 
                className="flex items-center"
                disabled={addCommentMutation.isPending || !comment.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {t('comments.submit')}
              </Button>
            </form>
          ) : (
            <div className="bg-primary-50 p-4 rounded-md mb-6">
              <p className="text-primary-700 text-sm">{t('comments.loginToComment')}</p>
              <Button asChild className="mt-2" size="sm">
                <Link to="/auth">{t('auth.login')}</Link>
              </Button>
            </div>
          )}

          {isLoadingComments ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('comments.noComments')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author?.avatar || undefined} />
                    <AvatarFallback className="bg-secondary-100 text-secondary-700">
                      {comment.author?.username ? comment.author.username.slice(0, 2).toUpperCase() : "AN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-sm">
                        {comment.author?.username || t('thread.anonymous')}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <div className="bg-neutral-50 rounded-md p-3">
                      <p className="text-sm whitespace-pre-line">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}