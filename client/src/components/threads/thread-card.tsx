import React from "react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  HeartHandshake,
  Heart,
  MessageCircle,
  Lightbulb,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ThreadCardProps {
  thread: {
    id: number;
    userId: number;
    content: string;
    category: string;
    mood?: string | null;
    createdAt: string;
    author?: {
      username: string;
      avatar?: string | null;
    };
    reactionCounts?: {
      understand: number;
      not_alone: number;
      will_overcome: number;
      idea: number;
      support: number;
    };
    commentCount?: number;
  };
  preview?: boolean;
}

export function ThreadCard({ thread, preview = false }: ThreadCardProps) {
  const { t } = useTranslation();
  
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      family: "bg-blue-100 text-blue-800 border-blue-200",
      school: "bg-amber-100 text-amber-800 border-amber-200",
      relationships: "bg-pink-100 text-pink-800 border-pink-200",
      loneliness: "bg-purple-100 text-purple-800 border-purple-200",
      other: "bg-slate-100 text-slate-800 border-slate-200",
    };

    const labels: Record<string, string> = {
      family: t('categories.family'),
      school: t('categories.school'),
      relationships: t('categories.relationships'),
      loneliness: t('categories.loneliness'),
      other: t('categories.other'),
    };

    return (
      <Badge variant="outline" className={`${colors[category] || colors.other}`}>
        {labels[category] || category}
      </Badge>
    );
  };

  const getMoodBadge = (mood: string | null | undefined) => {
    if (!mood) return null;
    
    const colors: Record<string, string> = {
      sad: "bg-blue-100 text-blue-800 border-blue-200",
      anxious: "bg-amber-100 text-amber-800 border-amber-200",
      calm: "bg-green-100 text-green-800 border-green-200",
      happy: "bg-pink-100 text-pink-800 border-pink-200",
      confused: "bg-purple-100 text-purple-800 border-purple-200",
      neutral: "bg-slate-100 text-slate-800 border-slate-200",
    };

    const labels: Record<string, string> = {
      sad: t('moods.sad'),
      anxious: t('moods.anxious'),
      calm: t('moods.calm'),
      happy: t('moods.happy'),
      confused: t('moods.confused'),
      neutral: t('moods.neutral'),
    };

    return (
      <Badge variant="outline" className={`${colors[mood] || colors.neutral}`}>
        {labels[mood] || mood}
      </Badge>
    );
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

  const formatContent = (content: string) => {
    if (preview && content.length > 250) {
      return content.substring(0, 250) + "...";
    }
    return content;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 bg-white fade-in">
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={thread.author?.avatar || undefined} />
            <AvatarFallback className="bg-primary-100 text-primary-700">
              {thread.author?.username.slice(0, 2).toUpperCase() || "AN"}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium text-sm">
              {thread.author?.username || t('thread.anonymous')}
            </span>
            <div className="flex gap-1 items-center text-xs text-muted-foreground">
              <time dateTime={thread.createdAt}>{formatDate(thread.createdAt)}</time>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {getCategoryBadge(thread.category)}
          {getMoodBadge(thread.mood)}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <p className="whitespace-pre-line text-sm">{formatContent(thread.content)}</p>
      </CardContent>
      {(thread.reactionCounts || thread.commentCount !== undefined) && (
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          <div className="flex space-x-3">
            {thread.reactionCounts && (
              <TooltipProvider>
                <div className="flex space-x-2">
                  {thread.reactionCounts.understand > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <HeartHandshake className="h-4 w-4 mr-1 text-pink-600" />
                          <span>{thread.reactionCounts.understand}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('reactions.understand')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {thread.reactionCounts.notAlone > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Shield className="h-4 w-4 mr-1 text-purple-600" />
                          <span>{thread.reactionCounts.notAlone}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('reactions.notAlone')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {thread.reactionCounts.will_overcome > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Heart className="h-4 w-4 mr-1 text-red-600" />
                          <span>{thread.reactionCounts.will_overcome}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('reactions.willOvercome')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {thread.reactionCounts.idea > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Lightbulb className="h-4 w-4 mr-1 text-amber-600" />
                          <span>{thread.reactionCounts.idea}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('reactions.idea')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {thread.reactionCounts.support > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <HeartHandshake className="h-4 w-4 mr-1 text-green-600" />
                          <span>{thread.reactionCounts.support}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('reactions.support')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            )}
          </div>
          
          <div className="flex items-center">
            {thread.commentCount !== undefined && (
              <div className="flex items-center mr-2 text-xs text-muted-foreground">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{thread.commentCount}</span>
              </div>
            )}
            
            {preview && (
              <Button variant="ghost" size="sm" asChild className="text-xs px-2">
                <Link to={`/threads/${thread.id}`} className="flex items-center">
                  {t('thread.viewMore')}
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}