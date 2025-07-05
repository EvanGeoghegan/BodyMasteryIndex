import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
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
import { Template, Workout as WorkoutType } from "@shared/schema";
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);
  const [workoutToEdit, setWorkoutToEdit] = useState<WorkoutType | null>(null);

  useEffect(() => {
    storage.initializeDefaultTemplates();
    
    const requestPermissions = async () => {
      await LocalNotifications.requestPermissions();
    };
    requestPermissions();

    // --- NEW: Add event listener for when a notification is tapped ---
    const handleNotificationTap = async (notification: ActionPerformed) => {
      const page = notification.notification.extra?.page;
      if (page) {
        setActiveTab(page);
      }
    };
    
    LocalNotifications.addListener('localNotificationActionPerformed', handleNotificationTap);

    // Clean up the listener when the component unmounts
    return () => {
      LocalNotifications.removeAllListeners();
    };
    // --- END NEW ---

  }, []);

  const handleWorkoutSaved = () => {
    setActiveTab("dashboard");
    setDashboardRefreshTrigger(prev => prev + 1);
  };

  const handleNavigateToWorkout = () => {
    setWorkoutToEdit(null);
    setActiveTab("workout");
  };

  const handleEditWorkout = (workout: WorkoutType) => {
    setWorkoutToEdit(workout);
    setActiveTab("workout");
  };

  const handleUseTemplate = (template: Template) => {
    setWorkoutToEdit(null);
    setActiveTab("workout");
  };

  const handleNavigateToNutrition = () => {
    setActiveTab("supplements");
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
        return <Settings />; 
      default:
        return <Dashboard onNavigateToWorkout={handleNavigateToWorkout} refreshTrigger={dashboardRefreshTrigger} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <main className="max-w-md mx-auto h-full bg-dark-primary text-text-primary overflow-y-auto pt-6">
          <div className="pb-24">
            {renderActiveTab()}
          </div>
          
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* We can likely remove this NotificationSystem component now */}
          <NotificationSystem 
            onNavigateToWorkout={handleNavigateToWorkout}
            onNavigateToNutrition={handleNavigateToNutrition}
          />
        </main>
        
        <Toaster />
        
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;