import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import ThreadCard from "./ThreadCard";
import { Button } from "@/components/ui/button";

interface ThreadWithCounts {
  id: number;
  userId: number;
  content: string;
  category: string;
  mood?: string;
  isRisky: boolean;
  riskLevel: number;
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

interface ThreadListProps {
  currentUserId: number;
  filter?: "latest" | "popular";
  category?: string;
}

const ThreadList = ({ currentUserId, filter = "latest", category }: ThreadListProps) => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<"latest" | "popular">(filter);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(category);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // Fetch threads from API
  const { data, isLoading, isError } = useQuery<ThreadWithCounts[]>({
    queryKey: ['/api/threads', { category: selectedCategory }],
  });

  // Filter and sort threads based on activeFilter
  const getFilteredThreads = () => {
    if (!data) return [];
    
    let filteredThreads = [...data];
    
    // Apply category filter if selected
    if (selectedCategory) {
      filteredThreads = filteredThreads.filter(thread => thread.category === selectedCategory);
    }
    
    // Apply sort based on filter
    if (activeFilter === "latest") {
      filteredThreads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeFilter === "popular") {
      filteredThreads.sort((a, b) => {
        const totalReactionsA = Object.values(a.reactionCounts).reduce((sum, count) => sum + count, 0);
        const totalReactionsB = Object.values(b.reactionCounts).reduce((sum, count) => sum + count, 0);
        return totalReactionsB - totalReactionsA;
      });
    }
    
    return filteredThreads;
  };

  const filteredThreads = getFilteredThreads();
  const paginatedThreads = filteredThreads.slice(0, page * PAGE_SIZE);
  const hasMore = paginatedThreads.length < filteredThreads.length;

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const setFilter = (filter: "latest" | "popular") => {
    setActiveFilter(filter);
  };

  const toggleCategoryFilter = () => {
    setShowCategoryFilter(!showCategoryFilter);
  };

  const selectCategory = (category: string | undefined) => {
    setSelectedCategory(category);
    setShowCategoryFilter(false);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-soft h-52"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft">
        <p className="text-destructive">{t('threadList.error')}</p>
        <p className="text-neutral-600">{t('threadList.errorDescription')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="font-heading font-semibold text-xl text-neutral-800">{t('threadList.title')}</h2>
          <div className="bg-accent-100 text-accent-700 rounded-full px-2 py-0.5 text-xs font-medium">
            {t('threadList.new')}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("latest")}
            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-full ${
              activeFilter === "latest" 
                ? "bg-primary-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <span className="ri-time-line mr-1"></span>
            <span>{t('threadList.latest')}</span>
          </button>
          <button
            onClick={() => setFilter("popular")}
            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-full ${
              activeFilter === "popular" 
                ? "bg-primary-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <span className="ri-fire-line mr-1"></span>
            <span>{t('threadList.popular')}</span>
          </button>
          <div className="relative">
            <button
              onClick={toggleCategoryFilter}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            >
              <span className="ri-apps-2-line mr-1"></span>
              <span>{t('threadList.categories')}</span>
            </button>
            
            {showCategoryFilter && (
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-lg shadow-lg p-2 border border-neutral-200 right-0">
                <button
                  onClick={() => selectCategory(undefined)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-neutral-50 ${!selectedCategory ? "bg-neutral-100" : ""}`}
                >
                  {t('threadList.allCategories')}
                </button>
                {["family", "school", "loneliness", "relationships", "other"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => selectCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-neutral-50 ${selectedCategory === cat ? "bg-neutral-100" : ""}`}
                  >
                    {t(`categories.${cat}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {paginatedThreads.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-soft text-center">
            <p className="text-neutral-600">{t('threadList.noThreads')}</p>
          </div>
        ) : (
          paginatedThreads.map(thread => (
            <ThreadCard 
              key={thread.id}
              thread={thread}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="bg-white hover:bg-neutral-50 text-primary-600"
          >
            {t('threadList.loadMore')}
          </Button>
        </div>
      )}
    </>
  );
};

export default ThreadList;
