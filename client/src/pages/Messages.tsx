import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
}

const Messages = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // For demo purposes
  const currentUserId = 1;
  
  // Mock conversation partners - in a real app this would be fetched from the API
  const conversationPartners: User[] = [
    { id: 2, username: "user_2" },
    { id: 3, username: "user_3" },
    { id: 4, username: "user_4" }
  ];
  
  // Fetch messages between current user and selected user
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [`/api/messages/${currentUserId}`, { otherId: selectedUserId }],
    enabled: selectedUserId !== null,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUserId) throw new Error("No receiver selected");
      
      const response = await apiRequest("POST", "/api/messages", {
        senderId: currentUserId,
        receiverId: selectedUserId,
        content
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${currentUserId}`] });
      toast({
        title: t('messages.sent'),
        description: t('messages.sentDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('messages.error'),
        description: error instanceof Error ? error.message : t('messages.errorDescription'),
        variant: "destructive",
      });
    }
  });
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast({
        title: t('messages.empty'),
        description: t('messages.emptyDescription'),
        variant: "destructive",
      });
      return;
    }
    
    sendMessageMutation.mutate(newMessage);
  };
  
  // Function to get initials from username
  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };
  
  // Function to get a color based on user ID
  const getUserColor = (userId: number) => {
    const colors = [
      "bg-primary-100 text-primary-600",
      "bg-secondary-100 text-secondary-600",
      "bg-accent-100 text-accent-600",
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600"
    ];
    return colors[userId % colors.length];
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="bg-primary-500 px-6 py-4">
          <h1 className="font-heading font-semibold text-xl text-white">
            {t('messages.title')}
          </h1>
        </div>
        
        <div className="flex flex-col md:flex-row h-[calc(80vh-8rem)]">
          {/* Conversation List */}
          <div className="md:w-1/3 border-r border-neutral-200 overflow-y-auto">
            <div className="p-4 border-b border-neutral-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('messages.search')}
                  className="w-full border border-neutral-200 rounded-lg pl-10 pr-4 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="absolute left-3 top-2.5 text-neutral-400 ri-search-line"></span>
              </div>
            </div>
            
            <div className="divide-y divide-neutral-100">
              {conversationPartners.map(user => (
                <button
                  key={user.id}
                  className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors flex items-center ${selectedUserId === user.id ? 'bg-neutral-50' : ''}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <Avatar className={`h-10 w-10 ${getUserColor(user.id)}`}>
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium text-neutral-800">{t('messages.anonymous')}</p>
                    <p className="text-sm text-neutral-500 truncate max-w-[180px]">
                      {t('messages.lastMessagePreview')}
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-neutral-500">
                    <span className="ri-time-line mr-1"></span>
                    <span>{t('messages.today')}</span>
                  </div>
                </button>
              ))}
              
              {conversationPartners.length === 0 && (
                <div className="p-6 text-center text-neutral-500">
                  <p className="text-lg mb-2">{t('messages.noConversations')}</p>
                  <p className="text-sm">{t('messages.startByCommenting')}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {selectedUserId ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-neutral-200 flex items-center">
                  <Avatar className={`h-10 w-10 ${getUserColor(selectedUserId)}`}>
                    <AvatarFallback>
                      {getInitials(conversationPartners.find(u => u.id === selectedUserId)?.username || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium text-neutral-800">{t('messages.anonymous')}</p>
                    <p className="text-xs text-green-500">{t('messages.online')}</p>
                  </div>
                  <button className="ml-auto p-2 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100">
                    <span className="ri-more-2-fill"></span>
                  </button>
                </div>
                
                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto bg-neutral-50">
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="w-2/3 h-12 bg-white rounded-lg ml-auto"></div>
                      <div className="w-2/3 h-12 bg-white rounded-lg"></div>
                      <div className="w-2/3 h-12 bg-white rounded-lg ml-auto"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                      <div className="text-5xl mb-3">
                        <span className="ri-message-3-line"></span>
                      </div>
                      <p className="text-lg mb-1">{t('messages.noMessagesYet')}</p>
                      <p className="text-sm">{t('messages.startConversation')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.senderId === currentUserId ? 'justify-end' : ''}`}
                        >
                          <div 
                            className={`max-w-[70%] rounded-2xl p-3 ${
                              message.senderId === currentUserId 
                                ? 'bg-primary-500 text-white rounded-br-none' 
                                : 'bg-white text-neutral-700 rounded-bl-none'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${message.senderId === currentUserId ? 'text-primary-100' : 'text-neutral-400'}`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-neutral-200 bg-white">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <textarea
                        placeholder={t('messages.typeMessage')}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-[60px]"
                      ></textarea>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-3 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100">
                        <span className="ri-emotion-line text-xl"></span>
                      </button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending}
                        className="bg-primary-500 hover:bg-primary-600 rounded-full h-10 w-10 p-0 flex items-center justify-center"
                      >
                        <span className="ri-send-plane-fill text-lg"></span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center text-xs text-neutral-500">
                    <div>
                      <span className="ri-lock-line mr-1"></span>
                      <span>{t('messages.privateConversation')}</span>
                    </div>
                    <div>
                      <span className="ri-shield-check-line mr-1"></span>
                      <span>{t('messages.moderated')}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // No conversation selected state
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-6">
                <div className="text-6xl mb-4">
                  <span className="ri-chat-3-line"></span>
                </div>
                <h2 className="text-xl font-heading font-semibold mb-2 text-neutral-700">
                  {t('messages.selectConversation')}
                </h2>
                <p className="text-center max-w-md mb-6">
                  {t('messages.selectConversationDescription')}
                </p>
                <a 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  <span className="ri-home-line mr-1"></span>
                  {t('messages.backToFeed')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Messages;
