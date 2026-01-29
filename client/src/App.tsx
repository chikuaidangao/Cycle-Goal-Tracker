import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import Dashboard from "@/pages/Dashboard";
import CycleDetail from "@/pages/CycleDetail";
import Alarms from "@/pages/Alarms";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/cycle/:id" component={CycleDetail} />
      <Route path="/alarms" component={Alarms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <Sidebar />
            <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto h-screen">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-end mb-4">
                  <LanguageSelector />
                </div>
                <Router />
              </div>
            </main>
            <Toaster />
          </div>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
