import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navigation from "@/components/Navigation";
import Tutorial from "@/components/Tutorial";
import NotificationSystem from "@/components/NotificationSystem";
import Dashboard from "@/pages/Dashboard";
import WorkoutPage from "@/pages/Workout";
import Templates from "@/pages/Templates";
import CalendarPage from "@/pages/CalendarPage";
import PersonalBests from "@/pages/PersonalBests";
import ProgressDashboard from "@/pages/ProgressDashboard";
import Supplements from "@/pages/Supplements";
import Settings from "@/pages/Settings";
import { storage } from "@/lib/storage";
import { Template, Exercise, ExerciseSet, Workout as WorkoutType } from "@shared/schema";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);
  const [workoutToEdit, setWorkoutToEdit] = useState<WorkoutType | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Initialize default templates on first load
    storage.initializeDefaultTemplates();
    
    // Check if user is first-time visitor
    const tutorialCompleted = localStorage.getItem('bmi_tutorial_completed');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  const handleWorkoutSaved = () => {
    setActiveTab("dashboard");
    setDashboardRefreshTrigger(prev => prev + 1); // Trigger dashboard refresh
  };

  const handleNavigateToWorkout = () => {
    setWorkoutToEdit(null); // Clear any existing workout being edited
    setActiveTab("workout");
  };

  const handleEditWorkout = (workout: WorkoutType) => {
    setWorkoutToEdit(workout);
    setActiveTab("workout");
  };

  const handleUseTemplate = (template: Template) => {
    // Convert template to workout format and navigate to workout page
    // This would populate the workout form with template data
    setWorkoutToEdit(null); // Clear any existing workout being edited
    setActiveTab("workout");
  };

  const handleNavigateToNutrition = () => {
    setActiveTab("supplements");
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigateToWorkout={handleNavigateToWorkout} onEditWorkout={handleEditWorkout} refreshTrigger={dashboardRefreshTrigger} onNavigateToNutrition={handleNavigateToNutrition} />;
      case "workout":
        return <WorkoutPage onWorkoutSaved={handleWorkoutSaved} initialWorkout={workoutToEdit} />;
      case "templates":
        return <Templates onUseTemplate={handleUseTemplate} />;
      case "calendar":
        return <CalendarPage />;
      case "records":
        return <PersonalBests />;
      case "progress":
        return <ProgressDashboard />;
      case "supplements":
        return <Supplements />;
      case "settings":
        return <Settings onShowTutorial={handleShowTutorial} />;
      default:
        return <Dashboard onNavigateToWorkout={handleNavigateToWorkout} refreshTrigger={dashboardRefreshTrigger} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-theme-primary text-theme-primary">
            <div className="max-w-md mx-auto bg-theme-primary min-h-screen relative">
              {renderActiveTab()}
              <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
              <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
              <NotificationSystem 
                onNavigateToWorkout={handleNavigateToWorkout}
                onNavigateToNutrition={handleNavigateToNutrition}
              />
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
