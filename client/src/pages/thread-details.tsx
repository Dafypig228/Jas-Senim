import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ThreadCard } from "@/components/threads/thread-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  Send, 
  HeartHandshake, 
  Heart, 
  Shield, 
  Lightbulb,
  MessageSquare,
  Share2,
  Flag,
  UserCircle,
  Bell,
  BellOff,
  Clock,
  Check,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

export default function ThreadDetailsPage() {
  const { t } = useTranslation();
  const { id = "0" } = useParams();
  const threadId = parseInt(id || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{id: number, author: string} | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    timestamp: Date;
  }>>([
    {
      id: 1,
      title: "Новый комментарий",
      message: "Пользователь прокомментировал ваш пост",
      isRead: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: 2,
      title: "Новая реакция",
      message: "Пользователь отреагировал на ваш пост",
      isRead: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 120)
    }
  ]);

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
    
    const commentText = replyTo 
      ? `@${replyTo.author}: ${comment}`
      : comment;
    
    addCommentMutation.mutate({ content: commentText });
    setReplyTo(null);
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
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 bg-white fade-in mb-4">
        <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={thread.thread?.author?.avatar || undefined} />
              <AvatarFallback className="bg-primary-100 text-primary-700 text-lg font-semibold">
                {thread.thread?.author?.username ? thread.thread.author.username.slice(0, 2).toUpperCase() : "AN"}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium">
                {thread.thread?.author?.username || t('thread.anonymous')}
              </span>
              <div className="flex gap-1 items-center text-xs text-muted-foreground">
                <time dateTime={thread.thread?.createdAt}>{formatDate(thread.thread?.createdAt)}</time>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {thread.thread?.category && (
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800">
                {t(`categories.${thread.thread.category}`)}
              </span>
            )}
            {thread.thread?.mood && (
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-purple-100 text-purple-800">
                {t(`moods.${thread.thread.mood}`)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <p className="whitespace-pre-line text-gray-800 leading-relaxed">
            {thread.thread?.content}
          </p>
        </CardContent>
        <div className="flex justify-between items-center p-3 bg-gray-50 border-t">
          <div className="flex space-x-3">
            <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1 text-gray-600">
              <MessageSquare className="h-4 w-4" />
              <span>{comments.length} {t('comments.title')}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                toast({
                  title: t('thread.shared'),
                  description: t('thread.sharedDesc')
                });
              }}
              className="text-xs flex items-center gap-1 text-gray-600"
            >
              <Share2 className="h-4 w-4" />
              <span>{t('thread.share')}</span>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                toast({
                  title: t('thread.reported'),
                  description: t('thread.reportedDesc')
                });
              }}
              className="text-xs flex items-center gap-1 text-gray-600"
            >
              <Flag className="h-4 w-4" />
              <span>{t('thread.report')}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                toast({
                  description: t('thread.dmSent')
                });
              }}
              className="text-xs flex items-center gap-1 text-gray-600"
            >
              <UserCircle className="h-4 w-4" />
              <span>{t('thread.directMessage')}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Reactions section */}
      <Card className="mt-6 mb-6 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-800">{t('thread.howDoYouFeel')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedReaction === "understand" ? "bg-pink-50 border-pink-300" : "bg-white hover:bg-pink-50/50 border-gray-200"}`}
              onClick={() => handleReactionClick("understand")}>
              <div className="p-3 rounded-full bg-pink-100 mb-2">
                <HeartHandshake className="h-6 w-6 text-pink-600" />
              </div>
              <span className="text-sm font-medium text-center">{t('reactions.understand')}</span>
            </div>
            
            <div className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedReaction === "not_alone" ? "bg-purple-50 border-purple-300" : "bg-white hover:bg-purple-50/50 border-gray-200"}`}
              onClick={() => handleReactionClick("not_alone")}>
              <div className="p-3 rounded-full bg-purple-100 mb-2">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-center">{t('reactions.notAlone')}</span>
            </div>
            
            <div className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedReaction === "will_overcome" ? "bg-red-50 border-red-300" : "bg-white hover:bg-red-50/50 border-gray-200"}`}
              onClick={() => handleReactionClick("will_overcome")}>
              <div className="p-3 rounded-full bg-red-100 mb-2">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm font-medium text-center">{t('reactions.willOvercome')}</span>
            </div>
            
            <div className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedReaction === "idea" ? "bg-amber-50 border-amber-300" : "bg-white hover:bg-amber-50/50 border-gray-200"}`}
              onClick={() => handleReactionClick("idea")}>
              <div className="p-3 rounded-full bg-amber-100 mb-2">
                <Lightbulb className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-center">{t('reactions.idea')}</span>
            </div>
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
              {replyTo && (
                <div className="mb-2 p-2 bg-blue-50 rounded-md border border-blue-200 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-700">{t('comments.replyingTo')} </span>
                    <span className="font-medium">{replyTo.author}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setReplyTo(null)}
                    className="h-7 w-7 p-0"
                  >
                    <span className="sr-only">{t('common.cancel')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </Button>
                </div>
              )}
              <Textarea 
                placeholder={replyTo 
                  ? t('comments.replyPlaceholder', { author: replyTo.author }) 
                  : t('comments.placeholder')}
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
                {replyTo ? t('comments.submitReply') : t('comments.submit')}
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
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">
                          {comment.author?.username || t('thread.anonymous')}
                        </h4>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      {user && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-gray-600 hover:text-gray-900"
                          onClick={() => {
                            setReplyTo({
                              id: comment.id,
                              author: comment.author?.username || t('thread.anonymous')
                            });
                            // Фокус на поле ввода после клика
                            setTimeout(() => {
                              document.querySelector('textarea')?.focus();
                            }, 100);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 10 20 15 15 20"></polyline>
                            <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
                          </svg>
                          {t('thread.reply')}
                        </Button>
                      )}
                    </div>
                    <div className="bg-neutral-50 rounded-md p-3">
                      <p className="text-sm whitespace-pre-line">
                        {comment.content.startsWith('@') ? (
                          <>
                            <span className="inline-block bg-blue-100 px-1 py-0.5 rounded text-blue-800 font-medium mb-1">
                              {comment.content.split(':')[0]}
                            </span>
                            <span>{comment.content.split(':').slice(1).join(':')}</span>
                          </>
                        ) : (
                          comment.content
                        )}
                      </p>
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