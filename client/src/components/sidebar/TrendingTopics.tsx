import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface Topic {
  category: string;
  count: number;
}

const TrendingTopics = () => {
  const { t } = useTranslation();
  
  const { data: topics = [], isLoading } = useQuery<Topic[]>({
    queryKey: ['/api/trending-topics'],
  });
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-soft overflow-hidden animate-pulse">
        <div className="bg-secondary-500 px-6 py-4">
          <div className="h-6 bg-white/20 rounded w-40"></div>
        </div>
        <div className="p-6 space-y-3">
          <div className="h-10 bg-secondary-50 rounded-lg"></div>
          <div className="h-10 bg-secondary-50 rounded-lg"></div>
          <div className="h-10 bg-secondary-50 rounded-lg"></div>
          <div className="h-10 bg-secondary-50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      <div className="bg-secondary-500 px-6 py-4">
        <h2 className="font-heading font-semibold text-lg text-white">{t('trending.title')}</h2>
      </div>
      <div className="p-6">
        <ul className="space-y-3">
          {topics.map((topic) => (
            <li key={topic.category}>
              <a 
                href={`/?category=${topic.category}`} 
                className="flex items-center justify-between py-2 px-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <span className="font-medium text-neutral-700">{t(`categories.${topic.category}`)}</span>
                <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-0.5 rounded-full">
                  {t('trending.threadsCount', { count: topic.count })}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <a href="/" className="inline-flex items-center text-secondary-600 hover:text-secondary-700 font-medium">
            <span>{t('trending.allTopics')}</span>
            <span className="ri-arrow-right-s-line ml-1"></span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrendingTopics;
