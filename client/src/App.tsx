import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import Analytics from "@/pages/analytics";
import Schedule from "@/pages/schedule";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import { Bell, User } from "lucide-react";

function Router() {
  const { data: demoUser } = useQuery({
    queryKey: ["/api/demo-user"],
  });

  // Onboarding disabled for now
  // if (demoUser && demoUser.hasCompletedOnboarding === "false") {
  //   return (
  //     <div className="min-h-screen">
  //       <Onboarding />
  //     </div>
  //   );
  // }

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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
