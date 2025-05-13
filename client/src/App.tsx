import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import EmergencyButton from "@/components/layout/EmergencyButton";
import Home from "@/pages/Home";
import MyThreads from "@/pages/MyThreads";
import Messages from "@/pages/Messages";
import Resources from "@/pages/Resources";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { EmotionalCheckin } from "@/components/EmotionalCheckin";
import { useEffect } from "react";

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <ProtectedRoute path="/my-threads" component={MyThreads} />
      <ProtectedRoute path="/messages" component={Messages} />
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
      {user && <EmotionalCheckin />}
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
