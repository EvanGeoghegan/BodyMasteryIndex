import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import Workout from "@/pages/Workout";
import Templates from "@/pages/Templates";
import CalendarPage from "@/pages/CalendarPage";
import PersonalBests from "@/pages/PersonalBests";
import { storage } from "@/lib/storage";
import { Template, Exercise, ExerciseSet } from "@shared/schema";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Initialize default templates on first load
    storage.initializeDefaultTemplates();
  }, []);

  const handleWorkoutSaved = () => {
    setActiveTab("dashboard");
  };

  const handleNavigateToWorkout = () => {
    setActiveTab("workout");
  };

  const handleUseTemplate = (template: Template) => {
    // Convert template to workout format and navigate to workout page
    // This would populate the workout form with template data
    setActiveTab("workout");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigateToWorkout={handleNavigateToWorkout} />;
      case "workout":
        return <Workout onWorkoutSaved={handleWorkoutSaved} />;
      case "templates":
        return <Templates onUseTemplate={handleUseTemplate} />;
      case "calendar":
        return <CalendarPage />;
      case "records":
        return <PersonalBests />;
      default:
        return <Dashboard onNavigateToWorkout={handleNavigateToWorkout} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-dark-primary text-text-primary">
          <div className="max-w-md mx-auto bg-dark-primary min-h-screen relative">
            {renderActiveTab()}
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
