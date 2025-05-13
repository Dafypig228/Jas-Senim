import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useModeration } from "@/hooks/useModeration";

interface CommentFormProps {
  threadId: number;
  currentUserId: number;
}

const CommentForm = ({ threadId, currentUserId }: CommentFormProps) => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getSuggestions, suggestions, isLoadingSuggestions } = useModeration();

  // Load suggestions when component mounts
  useEffect(() => {
    if (threadId) {
      getSuggestions(threadId, i18n.language);
    }
  }, [threadId, i18n.language, getSuggestions]);

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: { threadId: number; userId: number; content: string }) => {
      const response = await apiRequest("POST", `/api/threads/${threadId}/comments`, data);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      // Invalidate comments query to refresh list
      queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}/comments`] });
      queryClient.invalidateQueries({ queryKey: ['/api/threads'] }); // To update comment count in thread list
      toast({
        title: t('comments.success'),
        description: t('comments.successDescription'),
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: t('comments.error'),
        description: error instanceof Error ? error.message : t('comments.errorDescription'),
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: t('comments.emptyContent'),
        description: t('comments.emptyContentDescription'),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    createCommentMutation.mutate({
      threadId,
      userId: currentUserId,
      content,
    });
  };

  const applySuggestion = (suggestion: string) => {
    setContent(suggestion);
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="h-9 w-9 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
        <span className="font-medium text-neutral-600">А</span>
      </div>
      <div className="flex-1">
        <textarea
          placeholder={t('comments.placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-[80px] text-sm"
        ></textarea>
        
        {/* AI-assisted response suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => applySuggestion(suggestion)}
                className="bg-white hover:bg-neutral-50 text-neutral-700 text-xs px-3 py-1.5 rounded-full border border-neutral-200"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        )}
        
        <div className="mt-3 flex justify-between">
          <div className="flex space-x-2">
            <button className="text-neutral-500 hover:text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm">
              <span className="ri-emotion-line mr-1"></span>
            </button>
            <button className="text-neutral-500 hover:text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm">
              <span className="ri-attachment-2 mr-1"></span>
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={createCommentMutation.isPending}
            className={`bg-primary-500 hover:bg-primary-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              createCommentMutation.isPending ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {createCommentMutation.isPending ? t('comments.sending') : t('comments.send')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
