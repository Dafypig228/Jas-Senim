import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { CalendarDays, Heart, Award, Shield } from "lucide-react";

interface ProfileCardProps {
  user: {
    id: number;
    username: string;
    avatar?: string | null;
    supportedCount?: number;
    daysInCommunity?: number;
    badges?: Array<{ id: number; type: string; }>;
  };
  isCurrentUser?: boolean;
}

export function ProfileCard({ user, isCurrentUser = false }: ProfileCardProps) {
  const { t } = useTranslation();
  
  const getBadgeIcon = (type: string) => {
    switch(type) {
      case 'empath':
        return <Heart className="w-3 h-3 mr-1" />;
      case 'protector':
        return <Shield className="w-3 h-3 mr-1" />;
      case 'helper':
        return <Award className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'empath':
        return "bg-pink-100 text-pink-800 hover:bg-pink-200";
      case 'protector':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'good_listener':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'helper':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case 'regular':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getBadgeLabel = (type: string) => {
    switch(type) {
      case 'empath':
        return t('badges.empath');
      case 'protector':
        return t('badges.protector');
      case 'good_listener':
        return t('badges.goodListener');
      case 'helper':
        return t('badges.helper');
      case 'regular':
        return t('badges.regular');
      default:
        return type;
    }
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary-100 to-primary-50 pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src={user.avatar || undefined} alt={user.username} />
            <AvatarFallback className="bg-primary-200 text-primary-700 text-lg">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-bold">{user.username}</h3>
            {isCurrentUser && (
              <span className="text-sm text-muted-foreground">{t('profile.you')}</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          {user.supportedCount !== undefined && (
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-pink-500" />
              <span>{t('profile.supported', { count: user.supportedCount })}</span>
            </div>
          )}
          {user.daysInCommunity !== undefined && (
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
              <span>{t('profile.days', { count: user.daysInCommunity })}</span>
            </div>
          )}
        </div>
      </CardContent>
      {user.badges && user.badges.length > 0 && (
        <CardFooter className="border-t bg-muted/20 flex flex-wrap gap-1 pt-3">
          {user.badges.map((badge) => (
            <Badge 
              key={badge.id} 
              className={`${getBadgeColor(badge.type)} flex items-center text-xs`}
              variant="outline"
            >
              {getBadgeIcon(badge.type)}
              {getBadgeLabel(badge.type)}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}