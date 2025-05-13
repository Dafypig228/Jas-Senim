import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ru, kk } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import CommentForm from "./CommentForm";

interface Comment {
  id: number;
  threadId: number;
  userId: number;
  content: string;
  isRisky: boolean;
  createdAt: string;
}

interface CommentSectionProps {
  threadId: number;
  currentUserId: number;
}

const CommentSection = ({ threadId, currentUserId }: CommentSectionProps) => {
  const { t, i18n } = useTranslation();
  
  // Fetch comments for this thread
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/threads/${threadId}/comments`],
  });

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

  // First letter for the avatar - alternating between letters based on comment ID
  const getAvatarLetter = (commentId: number, userId: number) => {
    // Generate different avatars for different users
    return String.fromCharCode(65 + ((commentId + userId) % 26));
  };

  // Different background colors for avatar based on comment ID
  const getAvatarClass = (commentId: number) => {
    const colors = [
      "bg-neutral-200 text-neutral-600",
      "bg-primary-100 text-primary-600",
      "bg-secondary-100 text-secondary-600"
    ];
    return colors[commentId % colors.length];
  };

  if (isLoading) {
    return (
      <div className="border-t border-neutral-100 px-6 py-4 bg-neutral-50 fade-in">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-neutral-100 rounded-lg"></div>
          <div className="h-24 bg-neutral-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-100 px-6 py-4 bg-neutral-50 fade-in">
      <div className="mb-4">
        {comments.length === 0 ? (
          <div className="text-center text-neutral-500 py-4">
            <p>{t('comments.noComments')}</p>
            <p className="text-sm mt-1">{t('comments.beFirst')}</p>
          </div>
        ) : (
          comments.map((comment, index) => {
            const isAuthor = comment.userId === currentUserId;
            const isIndented = index > 0 && comments[index-1]?.userId !== comment.userId;
            
            return (
              <div 
                key={comment.id} 
                className={`flex items-start space-x-3 mb-6 ${isIndented ? "pl-12" : ""}`}
              >
                <div className={`${isAuthor ? "h-8 w-8" : "h-9 w-9"} rounded-full ${getAvatarClass(comment.id)} flex items-center justify-center flex-shrink-0`}>
                  <span className="font-medium">{getAvatarLetter(comment.id, comment.userId)}</span>
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex items-center mb-1">
                      <span className="font-medium text-neutral-800">
                        {isAuthor ? t('comments.author') : t('comments.anonymous')}
                      </span>
                      <span className="ml-2 text-xs text-neutral-500">{formatDate(comment.createdAt)}</span>
                      {index === 2 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                          {t('comments.volunteer')}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-700 text-sm">{comment.content}</p>
                    <div className="mt-2 flex space-x-2">
                      <button className="text-xs text-neutral-500 hover:text-neutral-700">
                        <span className="ri-heart-line mr-1"></span>
                        <span>{5 + comment.id}</span>
                      </button>
                      <button className="text-xs text-neutral-500 hover:text-neutral-700">
                        <span className="ri-chat-1-line mr-1"></span>
                        <span>{t('comments.reply')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comment form */}
      <CommentForm threadId={threadId} currentUserId={currentUserId} />
    </div>
  );
};

export default CommentSection;
