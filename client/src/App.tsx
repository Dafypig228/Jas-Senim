import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import EmergencyButton from "@/components/layout/EmergencyButton";
import HomePage from "@/pages/home-page";
import ThreadsPage from "@/pages/threads";
import MessagesPage from "@/pages/messages";
import Resources from "@/pages/Resources";
import AuthPage from "@/pages/auth-page";
import ThreadDetailsPage from "@/pages/thread-details";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/threads" component={ThreadsPage} />
      <Route path="/threads/:id" component={ThreadDetailsPage} />
      <ProtectedRoute path="/messages/:conversationId" component={MessagesPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <Route path="/resources" component={Resources} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user } = useAuth();
  
  // Set page title and meta description
  useEffect(() => {
    document.title = "Поддержка | Платформа эмоциональной поддержки подростков";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Анонимная платформа эмоциональной поддержки для подростков. Делитесь мыслями, получайте поддержку, помогайте другим.');
  }, []);

  return (
    <>
      <Header currentUser={user} notifications={2} />
      <Router />
      <EmergencyButton />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
