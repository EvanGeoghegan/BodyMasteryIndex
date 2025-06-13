import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dumbbell, Quote, History, Sparkles } from "lucide-react";
import ActivityCalendar from "@/components/ActivityCalendar";
import MuscleGroupHeatmap from "@/components/MuscleGroupHeatmap";
import { storage } from "@/lib/storage";
import { getDailyQuote } from "@/lib/quotes";
import { Workout } from "@shared/schema";
import confetti from 'canvas-confetti';

interface DashboardProps {
  onNavigateToWorkout: () => void;
  refreshTrigger?: number; // Add a prop to trigger refresh
}

export default function Dashboard({ onNavigateToWorkout, refreshTrigger }: DashboardProps) {
  const [lastWorkout, setLastWorkout] = useState<Workout | undefined>();
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const dailyQuote = getDailyQuote();

  const refreshData = () => {
    setLastWorkout(storage.getLastWorkout());
    setWorkoutDays(storage.getWorkoutDays());
    
    // Check if there's a workout completed today and we haven't shown congrats yet
    const today = new Date().toISOString().split('T')[0];
    const todayWorkouts = storage.getWorkouts().filter(workout => 
      workout.date.split('T')[0] === today
    );
    
    const lastCongratsDate = localStorage.getItem('lastCongratsDate');
    const congratsDismissedDate = localStorage.getItem('congratsDismissedDate');
    const hasShownCongratsToday = lastCongratsDate === today;
    const wasDismissedToday = congratsDismissedDate === today;
    
    if (todayWorkouts.length > 0 && !hasShownCongratsToday && !wasDismissedToday) {
      setShowCongrats(true);
      localStorage.setItem('lastCongratsDate', today);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (refreshTrigger) {
      refreshData();
    }
  }, [refreshTrigger]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  useEffect(() => {
    if (showCongrats) {
      triggerCelebration();
    }
  }, [showCongrats]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentDate = (): string => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      {/* Header */}
      <header className="bg-dark-secondary p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary font-heading">TrainLog</h1>
            <p className="text-text-secondary text-sm">{getCurrentDate()}</p>
          </div>
          <div className="w-12 h-12 bg-dark-elevated rounded-full flex items-center justify-center">
            <Dumbbell className="text-accent-red" size={24} />
          </div>
        </div>
      </header>

      {/* Congratulations Section */}
      {showCongrats && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-accent-green/20 to-accent-green/10 rounded-xl p-6 border border-accent-green/30 shadow-lg">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="text-accent-green mr-2" size={24} />
              <h2 className="text-xl font-bold text-accent-green">Congratulations!</h2>
              <Sparkles className="text-accent-green ml-2" size={24} />
            </div>
            <p className="text-text-primary text-center font-medium">
              You've completed a workout today! Keep up the great work and stay consistent with your fitness journey.
            </p>
            <Button
              onClick={() => {
                setShowCongrats(false);
                // Mark as dismissed for today so it won't show again until next workout completion
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem('congratsDismissedDate', today);
              }}
              variant="ghost"
              className="w-full mt-4 text-accent-green hover:text-accent-green hover:bg-accent-green/10"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Daily Quote Section */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-dark-secondary to-dark-elevated rounded-xl p-6 border border-dark-border shadow-lg">
          <p className="text-text-primary text-base italic leading-relaxed font-medium">
            "{dailyQuote.text}"
          </p>
          <p className="text-accent-light-red text-sm mt-4 font-medium">— {dailyQuote.author}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <Button 
          onClick={onNavigateToWorkout}
          className="w-full bg-accent-red hover:bg-accent-light-red text-white font-medium py-3 px-4 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          <Dumbbell className="mr-2" size={18} />
          <span>Log Workout</span>
        </Button>
      </div>

      {/* Last Activity Section */}
      <div className="px-4 pb-4">
        <div className="bg-dark-secondary rounded-xl p-5 border border-dark-border shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <History className="text-accent-navy mr-2" size={20} />
            Last Activity
          </h3>
          {lastWorkout ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Workout</span>
                <span className="text-text-primary font-medium">{lastWorkout.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Date</span>
                <span className="text-text-primary font-medium">
                  {formatDate(lastWorkout.date)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Exercises</span>
                <span className="text-text-primary font-medium">
                  {lastWorkout.exercises.length} exercises
                </span>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary">No workouts logged yet. Start your first workout!</p>
          )}
        </div>
      </div>


    </div>
  );
}
