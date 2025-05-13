import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ThreadCard } from "@/components/threads/thread-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { categories } from "@shared/schema";
import { Home, PlusCircle, Filter } from "lucide-react";

export default function ThreadsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const [category, setCategory] = useState<string | null>(null);

  // Thread list query
  const { data: threads, isLoading, isError } = useQuery({
    queryKey: ['/api/threads', category],
    queryFn: async ({ queryKey }) => {
      const [_, selectedCategory] = queryKey;
      const url = selectedCategory 
        ? `/api/threads?category=${selectedCategory}` 
        : '/api/threads';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }
      return response.json();
    },
  });

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? null : value);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('threads.title')}</h1>
        <p className="text-muted-foreground">{t('threads.description')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar with filters */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('threads.filter')}</CardTitle>
              <CardDescription>{t('threads.filterDescription')}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => setCategory(null)}
                >
                  <Home className="h-4 w-4 mr-2" />
                  {t('threads.all')}
                </Button>
                
                {categories.map((cat) => (
                  <Button 
                    key={cat} 
                    variant={category === cat ? "secondary" : "ghost"}
                    className="w-full justify-start" 
                    onClick={() => setCategory(cat)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {t(`categories.${cat}`)}
                  </Button>
                ))}
              </div>
              
              <div className="mt-6">
                <Button className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t('threads.create')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area with threads */}
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
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
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-center text-destructive">{t('threads.error')}</p>
              </CardContent>
            </Card>
          ) : threads && threads.length > 0 ? (
            <div className="space-y-4">
              {threads.map((thread: any) => (
                <ThreadCard 
                  key={thread.id} 
                  thread={thread} 
                  preview
                />
              ))}
            </div>
          ) : (
            <Card className="bg-muted/20">
              <CardContent className="pt-6 text-center">
                <p>{t('threads.empty')}</p>
                {category && (
                  <p className="mt-2 text-muted-foreground">{t('threads.emptyCategory', { category: t(`categories.${category}`) })}</p>
                )}
                <Button className="mt-4">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t('threads.createFirst')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}