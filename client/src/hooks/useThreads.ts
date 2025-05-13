import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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

interface UseThreadsOptions {
  category?: string;
  filter?: "latest" | "popular";
  userId?: number;
  limit?: number;
}

export function useThreads(options: UseThreadsOptions = {}) {
  const { i18n } = useTranslation();
  const { category, filter = "latest", userId, limit = 20 } = options;
  
  // Build query params
  const queryParams = new URLSearchParams();
  if (category) queryParams.append("category", category);
  if (limit) queryParams.append("limit", limit.toString());
  if (userId) queryParams.append("userId", userId.toString());
  
  // Create query key
  const queryKey = [
    "/api/threads",
    {
      category,
      filter,
      userId,
      limit,
      language: i18n.language
    }
  ];
  
  // Query threads
  const query = useQuery<Thread[]>({
    queryKey,
  });
  
  // Apply sorting based on filter
  const sortedThreads = query.data
    ? [...query.data].sort((a, b) => {
        if (filter === "latest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (filter === "popular") {
          // Sum all reaction counts for comparison
          const totalReactionsA = Object.values(a.reactionCounts).reduce((sum, count) => sum + count, 0);
          const totalReactionsB = Object.values(b.reactionCounts).reduce((sum, count) => sum + count, 0);
          return totalReactionsB - totalReactionsA;
        }
        return 0;
      })
    : [];
  
  return {
    ...query,
    threads: sortedThreads,
  };
}
