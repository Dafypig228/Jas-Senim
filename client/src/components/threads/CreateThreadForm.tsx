import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category, Mood, categories, moods } from "@shared/schema";

interface CreateThreadFormProps {
  userId: number;
}

const CreateThreadForm = ({ userId }: CreateThreadFormProps) => {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [mood, setMood] = useState<Mood | "">("");
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create thread mutation
  const createThreadMutation = useMutation({
    mutationFn: async (data: { userId: number; content: string; category: string; mood?: string }) => {
      const response = await apiRequest("POST", "/api/threads", data);
      return response.json();
    },
    onSuccess: () => {
      // Reset form and invalidate threads query to refresh list
      setContent("");
      setCategory("");
      setMood("");
      queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
      toast({
        title: t('createThread.success'),
        description: t('createThread.successDescription'),
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: t('createThread.error'),
        description: error instanceof Error ? error.message : t('createThread.errorDescription'),
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: t('createThread.emptyContent'),
        description: t('createThread.emptyContentDescription'),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (!category) {
      toast({
        title: t('createThread.emptyCategory'),
        description: t('createThread.emptyCategoryDescription'),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    createThreadMutation.mutate({
      userId,
      content,
      category,
      mood: mood || undefined
    });
  };

  const toggleMoodSelector = () => {
    setShowMoodSelector(!showMoodSelector);
  };

  const selectMood = (selectedMood: Mood) => {
    setMood(selectedMood);
    setShowMoodSelector(false);
  };

  // Map mood to emoji and color
  const moodEmoji = {
    sad: { emoji: "😢", label: t('moods.sad'), color: "text-blue-500" },
    anxious: { emoji: "😰", label: t('moods.anxious'), color: "text-red-500" },
    calm: { emoji: "😌", label: t('moods.calm'), color: "text-primary-500" },
    happy: { emoji: "😊", label: t('moods.happy'), color: "text-secondary-500" },
    confused: { emoji: "😕", label: t('moods.confused'), color: "text-yellow-500" },
    neutral: { emoji: "😐", label: t('moods.neutral'), color: "text-neutral-500" },
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-soft">
      <div className="flex items-start space-x-3">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="font-medium text-primary-600">А</span>
        </div>
        <div className="flex-1">
          <textarea
            placeholder={t('createThread.placeholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[100px]"
          ></textarea>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="bg-neutral-50 text-neutral-700 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="" disabled>
                  {t('createThread.selectCategory')}
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`categories.${cat}`)}
                  </option>
                ))}
              </select>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleMoodSelector}
                  className="inline-flex items-center text-neutral-500 hover:text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  <span className="ri-emotion-line mr-1"></span>
                  <span>
                    {mood ? (
                      <span className={`flex items-center ${moodEmoji[mood].color}`}>
                        <span className="mr-1">{moodEmoji[mood].emoji}</span>
                        {moodEmoji[mood].label}
                      </span>
                    ) : (
                      t('createThread.mood')
                    )}
                  </span>
                </button>
                
                {showMoodSelector && (
                  <div className="absolute z-10 mt-1 w-48 bg-white rounded-lg shadow-lg p-2 border border-neutral-200">
                    {moods.map((m) => (
                      <button
                        key={m}
                        onClick={() => selectMood(m)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-neutral-50 flex items-center ${
                          mood === m ? "bg-neutral-100" : ""
                        }`}
                      >
                        <span className="mr-2">{moodEmoji[m].emoji}</span>
                        <span className={moodEmoji[m].color}>{moodEmoji[m].label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={createThreadMutation.isPending}
              className={`bg-primary-500 hover:bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                createThreadMutation.isPending ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {createThreadMutation.isPending ? t('createThread.publishing') : t('createThread.publish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateThreadForm;
