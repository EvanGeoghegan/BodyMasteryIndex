import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { storage } from "@/lib/storage";
import Dashboard from "@/pages/Dashboard";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  useEffect(() => {
    // Initialize default templates on first load
    storage.initializeDefaultTemplates();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Body Mastery Index</h1>
            <p>Current tab: {activeTab}</p>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => setActiveTab("dashboard")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("workout")}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Workout
              </button>
            </div>
            
            {activeTab === "dashboard" && (
              <Dashboard 
                onNavigateToWorkout={() => setActiveTab("workout")}
                onEditWorkout={() => setActiveTab("workout")}
                refreshTrigger={dashboardRefreshTrigger}
              />
            )}
            
            {activeTab === "workout" && (
              <div className="mt-4 p-4 border rounded">
                <h2 className="text-xl">Workout</h2>
                <p>Start your workout here!</p>
              </div>
            )}
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;