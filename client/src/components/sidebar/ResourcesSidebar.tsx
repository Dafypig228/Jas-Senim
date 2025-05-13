import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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

const ResourcesSidebar = () => {
  const { t, i18n } = useTranslation();
  
  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ['/api/resources', { language: i18n.language }],
  });
  
  const { data: crisisContacts = [] } = useQuery<CrisisContact[]>({
    queryKey: ['/api/crisis-contacts', { language: i18n.language }],
  });
  
  // Filter emergency contacts for the sidebar
  const emergencyContacts = crisisContacts.filter(contact => 
    contact.type === 'hotline' || contact.type === 'chat'
  ).slice(0, 3);

  return (
    <>
      {/* Resources Box */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="bg-primary-500 px-6 py-4">
          <h2 className="font-heading font-semibold text-lg text-white">{t('resources.title')}</h2>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            {resources.slice(0, 4).map((resource) => (
              <li key={resource.id}>
                <a href={resource.url} className="flex items-center text-neutral-700 hover:text-primary-600 group">
                  <span className={`ri-${
                    resource.category === 'mental_health' ? 'mental-health-line' :
                    resource.category === 'crisis' ? 'first-aid-kit-line' :
                    resource.category === 'education' ? 'book-open-line' :
                    'chat-smile-3-line'
                  } text-xl text-primary-500 mr-3`}></span>
                  <span>{resource.title}</span>
                  <span className="ri-arrow-right-line ml-auto opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <a href="/resources" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
              <span>{t('resources.viewAll')}</span>
              <span className="ri-arrow-right-s-line ml-1"></span>
            </a>
          </div>
        </div>
      </div>

      {/* Crisis Hotlines */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="bg-destructive px-6 py-4">
          <h2 className="font-heading font-semibold text-lg text-white">{t('resources.emergencyHelp')}</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-destructive bg-opacity-10 flex items-center justify-center flex-shrink-0 mr-3">
                  <span className={`ri-${contact.type === 'hotline' ? 'phone' : 'message-2'}-line text-xl text-destructive`}></span>
                </div>
                <div>
                  <p className="font-medium text-neutral-800">{contact.name}</p>
                  <p className="text-neutral-600">{contact.phone || contact.url}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <button 
              onClick={() => document.querySelector('.emergency-button')?.dispatchEvent(new MouseEvent('click'))}
              className="bg-destructive hover:bg-red-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors shadow-sm"
            >
              {t('resources.getHelp')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResourcesSidebar;
