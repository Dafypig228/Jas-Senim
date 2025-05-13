import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ThreadCard from "@/components/threads/ThreadCard";
import ResourcesSidebar from "@/components/sidebar/ResourcesSidebar";
import AchievementsSidebar from "@/components/sidebar/AchievementsSidebar";

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

const MyThreads = () => {
  const { t } = useTranslation();
  const currentUserId = 1; // For demo purposes
  
  const { data: userThreads = [], isLoading, isError } = useQuery<Thread[]>({
    queryKey: [`/api/users/${currentUserId}/threads`],
    queryFn: async () => {
      // Since we don't have a specific endpoint for user threads, we'll filter from all threads
      const response = await fetch('/api/threads');
      const threads = await response.json();
      return threads.filter((thread: Thread) => thread.userId === currentUserId);
    },
  });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl p-6 mb-6 shadow-soft">
            <h1 className="font-heading font-bold text-2xl text-neutral-800 mb-3">
              {t('myThreads.title')}
            </h1>
            <p className="text-neutral-600">{t('myThreads.description')}</p>
          </div>

          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-soft h-52"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <p className="text-destructive">{t('myThreads.error')}</p>
              <p className="text-neutral-600">{t('myThreads.errorDescription')}</p>
            </div>
          ) : userThreads.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-soft text-center">
              <div className="text-neutral-400 text-5xl mb-4">
                <span className="ri-file-list-3-line"></span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-neutral-700 mb-2">
                {t('myThreads.noThreads')}
              </h3>
              <p className="text-neutral-600 mb-6">{t('myThreads.createFirst')}</p>
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <span className="ri-add-line mr-1"></span>
                {t('myThreads.createThread')}
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {userThreads.map(thread => (
                <ThreadCard 
                  key={thread.id}
                  thread={thread}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <AchievementsSidebar userId={currentUserId} />
          <ResourcesSidebar />
        </div>
      </div>
    </main>
  );
};

export default MyThreads;
