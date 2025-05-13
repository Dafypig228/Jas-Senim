import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import CreateThreadForm from "@/components/threads/CreateThreadForm";
import ThreadList from "@/components/threads/ThreadList";
import ResourcesSidebar from "@/components/sidebar/ResourcesSidebar";
import AchievementsSidebar from "@/components/sidebar/AchievementsSidebar";
import TrendingTopics from "@/components/sidebar/TrendingTopics";

const Home = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  
  // Extract search params from location
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryParam = searchParams.get('category');
  
  // For the demo, we'll use a hardcoded user ID
  const currentUserId = 1;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="lg:w-2/3">
          {/* Welcome Message */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-soft">
            <h1 className="font-heading font-bold text-2xl text-neutral-800 mb-3">
              {t('home.welcome')} 👋
            </h1>
            <p className="text-neutral-600">{t('home.welcomeDescription')}</p>
          </div>

          {/* Create Post Section */}
          <CreateThreadForm userId={currentUserId} />

          {/* Thread List */}
          <ThreadList 
            currentUserId={currentUserId} 
            filter="latest" 
            category={categoryParam || undefined}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <ResourcesSidebar />
          <AchievementsSidebar userId={currentUserId} />
          <TrendingTopics />
        </div>
      </div>
    </main>
  );
};

export default Home;
