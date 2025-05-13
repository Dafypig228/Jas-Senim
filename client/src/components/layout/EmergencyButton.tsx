import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, Heart, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function EmergencyButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  
  // Fetch crisis contacts
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['/api/crisis-contacts'],
    enabled: open, // Only fetch when dialog is opened
  });

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg z-50 emergency-button"
        variant="destructive"
      >
        <Phone className="h-6 w-6" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <Heart className="mr-2 h-5 w-5" /> 
              {t('emergency.title')}
            </DialogTitle>
            <DialogDescription>
              {t('emergency.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="text-center p-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">{t('emergency.loading')}</p>
              </div>
            ) : contacts && contacts.length > 0 ? (
              contacts.map((contact: any) => (
                <div key={contact.id} className="border-b pb-3 last:border-0">
                  <h3 className="font-medium text-destructive">{contact.name}</h3>
                  {contact.phone && (
                    <div className="mt-1 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="text-destructive hover:underline font-medium"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{contact.description}</p>
                  )}
                  {contact.url && (
                    <a 
                      href={contact.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      {t('emergency.website')}
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-4">
                <p>{t('emergency.noContacts')}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}