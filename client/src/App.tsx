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
import Macros from "@/pages/Macros";
import Settings from "@/pages/Settings";
import { storage } from "@/lib/storage";
import { Template, Workout as WorkoutType } from "@shared/schema";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  initNotifications,
  listenForNotificationActions,
  scheduleWeeklyAssessmentReminder,
} from "@/lib/notifications";
import { StatusBar, Style } from "@capacitor/status-bar";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);
  const [workoutToEdit, setWorkoutToEdit] = useState<WorkoutType | null>(null);

  useEffect(() => {
    (async () => {
      await initNotifications();
      // ensure our weekly assessment reminder is scheduled
      +(await scheduleWeeklyAssessmentReminder("20:00"));

      listenForNotificationActions(
        () => {
          // workout
          setWorkoutToEdit(null);
          setActiveTab("workout");
        },
        () => {
          // nutrition/macros
          setActiveTab("macros");
        },
        () => {
          setActiveTab("assessment");
        }
      );

      await StatusBar.setStyle({ style: Style.Dark }); // Light icons
      await StatusBar.setBackgroundColor({ color: "#0a0a0e" }); // Match your app theme
    })();

    return () => {
      LocalNotifications.removeAllListeners();
    };
  }, []);

  const handleWorkoutSaved = () => {
    setActiveTab("dashboard");
    setDashboardRefreshTrigger((prev) => prev + 1);
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
    setActiveTab("macros");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            onNavigateToWorkout={handleNavigateToWorkout}
            onEditWorkout={handleEditWorkout}
            refreshTrigger={dashboardRefreshTrigger}
            onNavigateToNutrition={handleNavigateToNutrition}
          />
        );
      case "workout":
        return (
          <WorkoutPage
            onWorkoutSaved={handleWorkoutSaved}
            initialWorkout={workoutToEdit}
          />
        );
      case "templates":
        return <Templates onUseTemplate={handleUseTemplate} />;
      case "calendar":
        return <CalendarPage />;
      case "records":
        return <PersonalBests />;
      case "progress":
        return <ProgressDashboard />;
      case "macros":
        return <Macros />;
      case "settings":
        return <Settings />;
      default:
        return (
          <Dashboard
            onNavigateToWorkout={handleNavigateToWorkout}
            refreshTrigger={dashboardRefreshTrigger}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <main className="max-w-md mx-auto h-full bg-dark-primary text-text-primary overflow-y-auto no-scrollbar">
          <div className="pb-24">{renderActiveTab()}</div>

          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

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
