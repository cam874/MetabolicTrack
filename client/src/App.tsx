import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Analytics from "@/pages/analytics";
import Schedule from "@/pages/schedule";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show landing page for unauthenticated users
  if (isLoading || !isAuthenticated) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/settings" component={Settings} />
        <Route path="/onboarding" component={Onboarding} />
        <Route component={NotFound} />
      </Switch>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
