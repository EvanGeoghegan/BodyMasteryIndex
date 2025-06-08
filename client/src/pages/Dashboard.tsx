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
            <Dumbbell className="text-accent-green" size={24} />
          </div>
        </div>
      </header>

      {/* Daily Quote Section */}
      <div className="p-4">
        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
          <div className="flex items-start space-x-3">
            <Quote className="text-accent-green mt-1" size={20} />
            <div>
              <p className="text-text-primary text-base italic leading-relaxed">
                "{dailyQuote.text}"
              </p>
              <p className="text-text-secondary text-sm mt-2">- {dailyQuote.author}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <Button 
          onClick={onNavigateToWorkout}
          className="w-full bg-accent-green hover:bg-green-500 text-dark-primary font-semibold py-4 px-6 h-auto shadow-lg"
        >
          <Dumbbell className="mr-2" size={20} />
          <span className="text-lg">Log Workout</span>
        </Button>
      </div>

      {/* Last Activity Section */}
      <div className="px-4 pb-4">
        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
          <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
            <History className="text-accent-green mr-2" size={20} />
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
              {lastWorkout.duration && (
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Duration</span>
                  <span className="text-text-primary font-medium">
                    {lastWorkout.duration} minutes
                  </span>
                </div>
              )}
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

      {/* Activity Calendar */}
      <div className="px-4 pb-6">
        <ActivityCalendar workoutDays={workoutDays} />
      </div>
    </div>
  );
}
