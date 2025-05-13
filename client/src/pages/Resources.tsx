import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrendingTopics from "@/components/sidebar/TrendingTopics";

interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
}

interface CrisisContact {
  id: number;
  name: string;
  phone?: string;
  description?: string;
  type: string;
  url?: string;
}

const Resources = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const { data: resources = [], isLoading: isLoadingResources } = useQuery<Resource[]>({
    queryKey: ['/api/resources', { language: i18n.language }],
  });
  
  const { data: crisisContacts = [], isLoading: isLoadingContacts } = useQuery<CrisisContact[]>({
    queryKey: ['/api/crisis-contacts', { language: i18n.language }],
  });
  
  const filteredResources = activeCategory === "all" 
    ? resources 
    : resources.filter(resource => resource.category === activeCategory);
  
  const resourceCategories = [
    { id: "all", label: t('resources.allCategories') },
    { id: "mental_health", label: t('resources.mentalHealth') },
    { id: "crisis", label: t('resources.crisis') },
    { id: "education", label: t('resources.education') },
    { id: "communication", label: t('resources.communication') }
  ];
  
  // Resource icon mapping based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mental_health': return "ri-mental-health-line";
      case 'crisis': return "ri-first-aid-kit-line";
      case 'education': return "ri-book-open-line";
      case 'communication': return "ri-chat-smile-3-line";
      default: return "ri-information-line";
    }
  };
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h1 className="font-heading font-bold text-2xl text-neutral-800 mb-3">
              {t('resources.pageTitle')}
            </h1>
            <p className="text-neutral-600">{t('resources.pageDescription')}</p>
          </div>
          
          {/* Resource Tabs */}
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <Tabs defaultValue="resources" className="w-full">
              <div className="bg-primary-500 px-6 py-4">
                <TabsList className="bg-primary-600/20 p-1">
                  <TabsTrigger 
                    value="resources" 
                    className="data-[state=active]:bg-white data-[state=active]:text-primary-700 text-white"
                  >
                    {t('resources.tabs.resources')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="emergency" 
                    className="data-[state=active]:bg-white data-[state=active]:text-primary-700 text-white"
                  >
                    {t('resources.tabs.emergency')}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="resources" className="p-0">
                <div className="p-6">
                  {/* Category Filters */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {resourceCategories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          activeCategory === category.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Resources List */}
                  {isLoadingResources ? (
                    <div className="space-y-4 animate-pulse">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-neutral-100 rounded-lg"></div>
                      ))}
                    </div>
                  ) : filteredResources.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-neutral-500">{t('resources.noResourcesFound')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredResources.map(resource => (
                        <div key={resource.id} className="bg-neutral-50 hover:bg-neutral-100 rounded-lg p-4 transition-colors">
                          <div className="flex items-start mb-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mr-3">
                              <span className={`${getCategoryIcon(resource.category)} text-xl text-primary-500`}></span>
                            </div>
                            <div>
                              <h3 className="font-heading font-semibold text-neutral-800">{resource.title}</h3>
                              <p className="text-sm text-neutral-500">{t(`resources.categories.${resource.category}`)}</p>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-600 mb-3">{resource.description}</p>
                          <a 
                            href={resource.url} 
                            className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            <span>{t('resources.viewResource')}</span>
                            <span className="ri-external-link-line ml-1"></span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="emergency" className="p-0">
                <div className="p-6">
                  <p className="text-neutral-700 mb-6">{t('resources.emergencyDescription')}</p>
                  
                  {isLoadingContacts ? (
                    <div className="space-y-4 animate-pulse">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-neutral-100 rounded-lg"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {crisisContacts.map(contact => (
                        <div key={contact.id} className="bg-neutral-50 hover:bg-neutral-100 rounded-lg p-4 transition-colors">
                          <div className="flex items-start">
                            <div className="h-12 w-12 rounded-full bg-destructive bg-opacity-10 flex items-center justify-center flex-shrink-0 mr-3">
                              <span className={`ri-${contact.type === 'hotline' ? 'phone' : contact.type === 'chat' ? 'message-2' : 'alarm-warning'}-line text-xl text-destructive`}></span>
                            </div>
                            <div>
                              <h3 className="font-heading font-semibold text-neutral-800">{contact.name}</h3>
                              {contact.description && (
                                <p className="text-sm text-neutral-600 mb-1">{contact.description}</p>
                              )}
                              {contact.phone && (
                                <p className="font-medium text-destructive">{contact.phone}</p>
                              )}
                              {contact.url && (
                                <a 
                                  href={contact.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center text-destructive hover:text-red-700 text-sm font-medium"
                                >
                                  <span>{t('resources.openLink')}</span>
                                  <span className="ri-external-link-line ml-1"></span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-8 p-4 border border-destructive border-opacity-20 bg-destructive bg-opacity-5 rounded-lg">
                    <div className="flex items-center mb-3">
                      <span className="ri-error-warning-line text-xl text-destructive mr-2"></span>
                      <h3 className="font-heading font-semibold text-neutral-800">{t('resources.emergency.title')}</h3>
                    </div>
                    <p className="text-neutral-700 text-sm mb-4">{t('resources.emergency.description')}</p>
                    <button 
                      onClick={() => document.querySelector('.emergency-button')?.dispatchEvent(new MouseEvent('click'))}
                      className="bg-destructive hover:bg-red-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors shadow-sm w-full sm:w-auto"
                    >
                      {t('resources.getHelp')}
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="lg:w-1/3 space-y-6">
          <TrendingTopics />
          
          {/* Additional Help Card */}
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="bg-secondary-500 px-6 py-4">
              <h2 className="font-heading font-semibold text-lg text-white">{t('resources.additionalHelp.title')}</h2>
            </div>
            <div className="p-6">
              <p className="text-neutral-700 mb-4">{t('resources.additionalHelp.description')}</p>
              <div className="space-y-4">
                <a href="#" className="flex items-center bg-secondary-50 hover:bg-secondary-100 p-3 rounded-lg transition-colors">
                  <span className="ri-article-line text-xl text-secondary-500 mr-3"></span>
                  <span className="text-neutral-700">{t('resources.additionalHelp.articles')}</span>
                </a>
                <a href="#" className="flex items-center bg-secondary-50 hover:bg-secondary-100 p-3 rounded-lg transition-colors">
                  <span className="ri-question-answer-line text-xl text-secondary-500 mr-3"></span>
                  <span className="text-neutral-700">{t('resources.additionalHelp.faq')}</span>
                </a>
                <a href="#" className="flex items-center bg-secondary-50 hover:bg-secondary-100 p-3 rounded-lg transition-colors">
                  <span className="ri-community-line text-xl text-secondary-500 mr-3"></span>
                  <span className="text-neutral-700">{t('resources.additionalHelp.community')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Resources;
