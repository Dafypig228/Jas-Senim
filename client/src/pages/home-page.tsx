import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { ThreadCard } from "@/components/threads/thread-card";
import { EmotionalCheckin } from "@/components/EmotionalCheckin";
import { 
  Heart, 
  MessageCircle, 
  ChevronRight, 
  Users, 
  BookOpen, 
  AlertCircle,
  Phone
} from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Fetch trending topics
  const { data: trendingTopics, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['/api/trending-topics'],
    enabled: true,
  });

  // Fetch recent threads
  const { data: recentThreads, isLoading: isLoadingThreads } = useQuery({
    queryKey: ['/api/threads'],
    queryFn: async () => {
      const response = await fetch('/api/threads?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }
      return response.json();
    },
    enabled: true,
  });

  // Fetch resources
  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ['/api/resources'],
    enabled: true,
  });

  // Fetch crisis contacts
  const { data: crisisContacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['/api/crisis-contacts'],
    enabled: true,
  });

  // Determine if user needs to do an emotional check-in
  const { data: checkinNeeded, isLoading: isLoadingCheckin } = useQuery({
    queryKey: ['/api/checkin/needed'],
    enabled: !!user,
  });

  return (
    <div className="container mx-auto p-4">
      {/* Hero section */}
      <section className="mb-10 mt-4">
        <div className="rounded-xl bg-gradient-to-r from-primary-100 via-primary-50 to-accent-50 p-6 md:p-10 shadow-sm">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg text-primary-800 mb-6">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="font-medium">
                <Link to="/threads">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t('home.hero.browseThreads')}
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="bg-white/80 font-medium">
                <Link to="/resources">
                  <BookOpen className="mr-2 h-5 w-5" />
                  {t('home.hero.exploreResources')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          {/* Emotional check-in (if needed) */}
          {user && checkinNeeded?.isNeeded && (
            <Card className="shadow-sm border-secondary-100">
              <CardHeader className="bg-gradient-to-r from-secondary-50 to-secondary-100/50 pb-2">
                <CardTitle>{t('checkin.title')}</CardTitle>
                <CardDescription>{t('checkin.description')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <EmotionalCheckin />
              </CardContent>
            </Card>
          )}

          {/* Recent threads */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{t('home.recentThreads.title')}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/threads" className="flex items-center">
                    {t('home.recentThreads.viewAll')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>{t('home.recentThreads.description')}</CardDescription>
            </CardHeader>
            <CardContent className="py-4 space-y-4">
              {isLoadingThreads ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20 mt-1" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))
              ) : recentThreads && recentThreads.length > 0 ? (
                recentThreads.slice(0, 3).map((thread: any) => (
                  <ThreadCard key={thread.id} thread={thread} preview />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {t('home.recentThreads.empty')}
                </p>
              )}
            </CardContent>
            <CardFooter className="bg-muted/20 pt-3">
              <Button asChild className="w-full">
                <Link to="/threads/new">
                  {t('home.recentThreads.createThread')}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Resources */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{t('home.resources.title')}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/resources" className="flex items-center">
                    {t('home.resources.viewAll')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>{t('home.resources.description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {isLoadingResources ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border shadow-none">
                    <CardHeader className="p-4 pb-2">
                      <Skeleton className="h-5 w-48" />
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : resources && resources.length > 0 ? (
                resources.slice(0, 4).map((resource: any) => (
                  <Card 
                    key={resource.id} 
                    className="border shadow-none hover:shadow-sm transition-shadow support-card"
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-muted-foreground mb-3">
                        {resource.description}
                      </p>
                      {resource.url && (
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {t('resources.readMore')}
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center text-muted-foreground py-4">
                  <p>{t('home.resources.empty')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-6">
          {/* Emergency contacts */}
          <Card className="shadow-sm border-destructive/10">
            <CardHeader className="bg-destructive/5 pb-2">
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                {t('home.emergency.title')}
              </CardTitle>
              <CardDescription>{t('home.emergency.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {isLoadingContacts ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              ) : crisisContacts && crisisContacts.length > 0 ? (
                crisisContacts.slice(0, 3).map((contact: any) => (
                  <div key={contact.id} className="mb-3">
                    <h4 className="font-medium text-destructive">{contact.name}</h4>
                    {contact.phone && (
                      <div className="flex items-center text-sm mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        <a 
                          href={`tel:${contact.phone}`}
                          className="text-destructive hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {contact.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-2">
                  {t('home.emergency.empty')}
                </p>
              )}
            </CardContent>
            <CardFooter className="bg-muted/20 pt-3">
              <Button variant="destructive" className="w-full emergency-button" asChild>
                <Link to="/crisis">
                  {t('home.emergency.viewAll')}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Trending topics */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>{t('home.trending.title')}</CardTitle>
              <CardDescription>{t('home.trending.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              {isLoadingTrending ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-10" />
                    </div>
                  ))}
                </div>
              ) : trendingTopics && trendingTopics.length > 0 ? (
                <div className="space-y-2">
                  {trendingTopics.map((topic: any, index: number) => (
                    <div 
                      key={topic.category} 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Link 
                        to={`/threads?category=${topic.category}`}
                        className="flex items-center text-sm font-medium hover:text-primary"
                      >
                        <span className="text-muted-foreground mr-2">#{index + 1}</span>
                        {t(`categories.${topic.category}`)}
                      </Link>
                      <Badge variant="outline" className="bg-muted">
                        {topic.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {t('home.trending.empty')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Community stats */}
          <Card className="shadow-sm bg-primary-50">
            <CardHeader className="pb-2">
              <CardTitle>{t('home.community.title')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-3 rounded-md bg-white shadow-sm">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <span className="text-2xl font-bold">127</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {t('home.community.usersHelped')}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-md bg-white shadow-sm">
                  <Heart className="h-8 w-8 mb-2 text-primary" />
                  <span className="text-2xl font-bold">582</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {t('home.community.supportActions')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}