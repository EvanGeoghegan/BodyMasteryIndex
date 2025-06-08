import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dumbbell, Quote, History } from "lucide-react";
import ActivityCalendar from "@/components/ActivityCalendar";
import { storage } from "@/lib/storage";
import { getDailyQuote } from "@/lib/quotes";
import { Workout } from "@shared/schema";

interface DashboardProps {
  onNavigateToWorkout: () => void;
}

export default function Dashboard({ onNavigateToWorkout }: DashboardProps) {
  const [lastWorkout, setLastWorkout] = useState<Workout | undefined>();
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const dailyQuote = getDailyQuote();

  useEffect(() => {
    setLastWorkout(storage.getLastWorkout());
    setWorkoutDays(storage.getWorkoutDays());
  }, []);

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
            <h1 className="text-2xl font-bold text-text-primary">TrainLog</h1>
            <p className="text-text-secondary text-sm">{getCurrentDate()}</p>
          </div>
          <div className="w-12 h-12 bg-dark-elevated rounded-full flex items-center justify-center">
            <Dumbbell className="text-accent-navy" size={24} />
          </div>
        </div>
      </header>

      {/* Daily Quote Section */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-dark-secondary to-dark-elevated rounded-xl p-6 border border-dark-border shadow-lg">
          <p className="text-text-primary text-base italic leading-relaxed font-medium">
            "{dailyQuote.text}"
          </p>
          <p className="text-accent-light-navy text-sm mt-4 font-medium">— {dailyQuote.author}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <Button 
          onClick={onNavigateToWorkout}
          className="w-full bg-accent-navy hover:bg-accent-light-navy text-white font-medium py-3 px-4 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
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
