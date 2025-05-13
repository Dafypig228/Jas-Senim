import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

interface EmergencyModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface CrisisContact {
  id: number;
  name: string;
  phone?: string;
  description?: string;
  type: string;
  url?: string;
}

const EmergencyModal = ({ isVisible, onClose }: EmergencyModalProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch crisis contacts from API
  const { data: crisisContacts = [] } = useQuery<CrisisContact[]>({
    queryKey: ['/api/crisis-contacts'],
    enabled: isVisible, // Only fetch when modal is visible
  });

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // Group contacts by type
  const hotlineContacts = crisisContacts.filter(contact => contact.type === 'hotline');
  const chatContacts = crisisContacts.filter(contact => contact.type === 'chat');
  const emergencyContacts = crisisContacts.filter(contact => contact.type === 'emergency');

  return (
    <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-50 flex items-center justify-center">
      <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-destructive px-6 py-4 flex justify-between items-center">
          <h2 className="font-heading font-semibold text-xl text-white">{t('emergency.title')}</h2>
          <button className="text-white hover:text-neutral-200" onClick={onClose}>
            <span className="ri-close-line text-xl"></span>
          </button>
        </div>
        <div className="p-6">
          <p className="text-neutral-700 mb-4">{t('emergency.description')}</p>
          
          <div className="mb-6 space-y-4">
            {hotlineContacts.length > 0 && (
              <div className="flex items-center p-3 bg-destructive bg-opacity-10 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-destructive bg-opacity-20 flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="ri-phone-line text-xl text-destructive"></span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">{hotlineContacts[0].name}</p>
                  <p className="text-neutral-600 text-sm">{hotlineContacts[0].description}</p>
                  <p className="font-medium text-destructive">{hotlineContacts[0].phone}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center p-3 bg-primary-50 rounded-lg">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mr-3">
                <span className="ri-team-line text-xl text-primary-500"></span>
              </div>
              <div>
                <p className="font-semibold text-neutral-800">{t('emergency.specialist')}</p>
                <p className="text-neutral-600 text-sm">{t('emergency.consultation')}</p>
                <button className="mt-1 text-sm text-primary-600 font-medium">{t('emergency.startChat')}</button>
              </div>
            </div>
            
            {chatContacts.length > 0 && (
              <div className="flex items-center p-3 bg-secondary-50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="ri-message-3-line text-xl text-secondary-500"></span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">{chatContacts[0].name}</p>
                  <p className="text-neutral-600 text-sm">{chatContacts[0].description}</p>
                  <a 
                    href={chatContacts[0].url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-1 text-sm text-secondary-600 font-medium inline-block"
                  >
                    {t('emergency.openTelegram')}
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm text-neutral-600 mb-4">{t('emergency.emergencyWarning')}</p>
            <div className="grid grid-cols-2 gap-3">
              {emergencyContacts.slice(0, 2).map((contact) => (
                <div key={contact.id} className="text-center p-3 bg-neutral-50 rounded-lg">
                  <p className="font-semibold text-neutral-800">{contact.name}</p>
                  <p className="font-medium text-neutral-700">{contact.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
