import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru, kk } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import CommentSection from "./CommentSection";
import { useToast } from "@/hooks/use-toast";

interface Thread {
  id: number;
  userId: number;
  content: string;
  category: string;
  mood?: string;
  isRisky: boolean;
  createdAt: string;
  reactionCounts: {
    understand: number;
    not_alone: number;
    will_overcome: number;
    idea: number;
    support: number;
  };
  commentCount: number;
}

interface ThreadCardProps {
  thread: Thread;
  currentUserId: number;
}

const ThreadCard = ({ thread, currentUserId }: ThreadCardProps) => {
  const { t, i18n } = useTranslation();
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Date formatting with localization
  const getLocale = () => {
    switch (i18n.language) {
      case 'ru': return ru;
      case 'kk': return kk;
      default: return undefined;
    }
  };

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: getLocale(),
    });
  };

  // Reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const response = await apiRequest('POST', `/api/threads/${thread.id}/reactions`, {
        userId: currentUserId,
        type,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
    },
    onError: (error) => {
      toast({
        title: t('reactions.error'),
        description: error instanceof Error ? error.message : t('reactions.errorDescription'),
        variant: "destructive",
      });
    }
  });

  const handleReaction = (type: string) => {
    addReactionMutation.mutate({ type });
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Map mood to emoji and text
  const moodEmoji = {
    sad: { emoji: "😢", label: t('moods.sad'), className: "text-blue-500" },
    anxious: { emoji: "😰", label: t('moods.anxious'), className: "text-destructive" },
    calm: { emoji: "😌", label: t('moods.calm'), className: "text-primary-500" },
    happy: { emoji: "😊", label: t('moods.happy'), className: "text-secondary-500" },
    confused: { emoji: "😕", label: t('moods.confused'), className: "text-yellow-500" },
    neutral: { emoji: "😐", label: t('moods.neutral'), className: "text-neutral-500" }
  };

  // Reaction configuration
  const reactions = [
    { 
      type: "understand", 
      emoji: "🤗", 
      label: t('reactions.understand'), 
      count: thread.reactionCounts.understand,
      className: "bg-primary-50 hover:bg-primary-100 text-primary-700" 
    },
    { 
      type: "not_alone", 
      emoji: "✨", 
      label: t('reactions.notAlone'), 
      count: thread.reactionCounts.not_alone,
      className: "bg-accent-50 hover:bg-accent-100 text-accent-700" 
    },
    { 
      type: "will_overcome", 
      emoji: "💪", 
      label: t('reactions.willOvercome'), 
      count: thread.reactionCounts.will_overcome,
      className: "bg-neutral-50 hover:bg-neutral-100 text-neutral-700" 
    }
  ];

  // Add extra reactions based on thread category
  if (thread.category === "school") {
    reactions.push({
      type: "idea",
      emoji: "💡",
      label: t('reactions.idea'),
      count: thread.reactionCounts.idea,
      className: "bg-secondary-50 hover:bg-secondary-100 text-secondary-700"
    });
  } 
  else if (thread.category === "family") {
    reactions.push({
      type: "support",
      emoji: "❤️",
      label: t('reactions.support'),
      count: thread.reactionCounts.support,
      className: "bg-secondary-50 hover:bg-secondary-100 text-secondary-700"
    });
  }

  // First letter for the avatar
  const avatarLetter = String.fromCharCode(65 + (thread.id % 26));
  
  // Different background colors for avatar based on category
  const avatarColors = {
    family: "bg-primary-100 text-primary-600",
    school: "bg-secondary-100 text-secondary-600",
    loneliness: "bg-accent-100 text-accent-600",
    relationships: "bg-blue-100 text-blue-600",
    other: "bg-purple-100 text-purple-600"
  };
  
  const avatarClass = avatarColors[thread.category as keyof typeof avatarColors] || "bg-neutral-100 text-neutral-600";

  return (
    <div className="support-card bg-white rounded-xl shadow-soft overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full ${avatarClass} flex items-center justify-center mr-3`}>
              <span className="font-medium">{avatarLetter}</span>
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-semibold text-neutral-800">{t('threadCard.anonymous')}</span>
                <span className="ml-2 text-xs text-neutral-500">{formatDate(thread.createdAt)}</span>
              </div>
              <div className="flex items-center mt-0.5">
                <span className={`bg-${thread.category === 'family' ? 'accent' : thread.category === 'school' ? 'secondary' : 'primary'}-100 text-${thread.category === 'family' ? 'accent' : thread.category === 'school' ? 'secondary' : 'primary'}-700 text-xs rounded-full px-2 py-0.5 font-medium`}>
                  {t(`categories.${thread.category}`)}
                </span>
                {thread.mood && (
                  <span className={`ml-2 inline-flex items-center ${moodEmoji[thread.mood as keyof typeof moodEmoji].className}`}>
                    <span className="ri-emotion-line text-sm mr-1"></span>
                    <span className="text-xs">{moodEmoji[thread.mood as keyof typeof moodEmoji].label}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="text-neutral-400 hover:text-neutral-600">
            <span className="ri-more-2-fill"></span>
          </button>
        </div>
        <div className="mb-4">
          <p className="text-neutral-700">{thread.content}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {reactions.map((reaction) => (
            <button 
              key={reaction.type} 
              className={`react-button inline-flex items-center px-3 py-1.5 ${reaction.className} rounded-full text-sm`}
              onClick={() => handleReaction(reaction.type)}
              disabled={addReactionMutation.isPending}
            >
              <span className="emoji mr-1.5">{reaction.emoji}</span>
              <span>{reaction.label}</span>
              <span className={`ml-1.5 bg-${reaction.type === 'understand' ? 'primary' : reaction.type === 'not_alone' ? 'accent' : reaction.type === 'will_overcome' ? 'neutral' : 'secondary'}-100 text-${reaction.type === 'understand' ? 'primary' : reaction.type === 'not_alone' ? 'accent' : reaction.type === 'will_overcome' ? 'neutral' : 'secondary'}-700 rounded-full px-1.5 py-0.5 text-xs`}>
                {reaction.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-3 flex justify-between">
        <div className="flex items-center space-x-4">
          <button 
            className="inline-flex items-center text-neutral-600 hover:text-primary-600"
            onClick={toggleComments}
          >
            <span className="ri-message-3-line mr-1"></span>
            <span className="text-sm">
              {t('threadCard.comments', { count: thread.commentCount })}
            </span>
          </button>
          <button className="inline-flex items-center text-neutral-600 hover:text-primary-600">
            <span className="ri-chat-private-line mr-1"></span>
            <span className="text-sm">{t('threadCard.writePrivately')}</span>
          </button>
        </div>
        <button className="text-neutral-600 hover:text-primary-600">
          <span className="ri-share-line"></span>
        </button>
      </div>

      {/* Comments section (expanded) */}
      {showComments && (
        <CommentSection 
          threadId={thread.id} 
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default ThreadCard;
