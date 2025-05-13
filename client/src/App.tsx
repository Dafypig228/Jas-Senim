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
import { useEffect, useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-threads" component={MyThreads} />
      <Route path="/messages" component={Messages} />
      <Route path="/resources" component={Resources} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Demo user state for the prototype
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    username: "anonymous",
    language: "ru"
  });

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Header currentUser={currentUser} notifications={2} />
        <Toaster />
        <Router />
        <EmergencyButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
