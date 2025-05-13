import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface UserStats {
  supportedCount: number;
  daysInCommunity: number;
  badges: Badge[];
}

interface Badge {
  id: number;
  userId: number;
  type: string;
  createdAt: string;
}

interface AchievementsSidebarProps {
  userId: number;
}

const AchievementsSidebar = ({ userId }: AchievementsSidebarProps) => {
  const { t } = useTranslation();
  
  const { data: userStats, isLoading } = useQuery<UserStats>({
    queryKey: [`/api/users/${userId}/stats`],
  });
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-soft overflow-hidden animate-pulse">
        <div className="bg-accent-500 px-6 py-4">
          <div className="h-6 bg-white/20 rounded w-48"></div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent-50 rounded-lg p-4 h-24"></div>
            <div className="bg-accent-50 rounded-lg p-4 h-24"></div>
          </div>
          <div className="h-4 bg-neutral-100 rounded w-36"></div>
          <div className="flex flex-wrap gap-3">
            <div className="h-12 w-12 bg-neutral-100 rounded-full"></div>
            <div className="h-12 w-12 bg-neutral-100 rounded-full"></div>
            <div className="h-12 w-12 bg-neutral-100 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const supportedCount = userStats?.supportedCount || 0;
  const daysInCommunity = userStats?.daysInCommunity || 0;
  const badges = userStats?.badges || [];
  
  // Badge configuration
  const badgeConfig = {
    empath: { icon: "ri-heart-line", color: "primary", label: t('badges.empath') },
    protector: { icon: "ri-shield-star-line", color: "secondary", label: t('badges.protector') },
    good_listener: { icon: "ri-chat-smile-3-line", color: "accent", label: t('badges.goodListener') },
    helper: { icon: "ri-first-aid-kit-line", color: "green", label: t('badges.helper') },
    regular: { icon: "ri-calendar-check-line", color: "blue", label: t('badges.regular') }
  };
  
  // Get unique badges
  const uniqueBadges = badges.filter((badge, index, self) => 
    index === self.findIndex((b) => b.type === badge.type)
  );
  
  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      <div className="bg-accent-500 px-6 py-4">
        <h2 className="font-heading font-semibold text-lg text-white">{t('achievements.title')}</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-accent-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-heading font-bold text-accent-700">{supportedCount}</p>
            <p className="text-sm text-neutral-600">{t('achievements.supportedPeople')}</p>
          </div>
          <div className="bg-accent-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-heading font-bold text-accent-700">{daysInCommunity}</p>
            <p className="text-sm text-neutral-600">{t('achievements.daysInCommunity')}</p>
          </div>
        </div>
        <h3 className="font-medium text-neutral-800 mb-3">{t('achievements.yourBadges')}</h3>
        <div className="flex flex-wrap gap-3">
          {uniqueBadges.map((badge) => {
            const config = badgeConfig[badge.type as keyof typeof badgeConfig];
            return (
              <div key={badge.id} className="text-center">
                <div className={`h-12 w-12 bg-${config.color}-100 text-${config.color}-500 rounded-full flex items-center justify-center mb-1`}>
                  <span className={`${config.icon} text-xl`}></span>
                </div>
                <p className="text-xs text-neutral-600">{config.label}</p>
              </div>
            );
          })}
          
          {/* Locked badge - always show one locked badge */}
          <div className="text-center">
            <div className="h-12 w-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mb-1">
              <span className="ri-lock-line text-xl"></span>
            </div>
            <p className="text-xs text-neutral-400">{t('achievements.locked')}</p>
          </div>
        </div>
        <div className="mt-5">
          <a href="#" className="inline-flex items-center text-accent-600 hover:text-accent-700 font-medium">
            <span>{t('achievements.viewAll')}</span>
            <span className="ri-arrow-right-s-line ml-1"></span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AchievementsSidebar;
