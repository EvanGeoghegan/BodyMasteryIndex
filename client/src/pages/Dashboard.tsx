import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Quote, History, Sparkles, Droplets, Target } from "lucide-react";
import ActivityCalendar from "@/components/ActivityCalendar";
import { storage } from "@/lib/storage";
import { getDailyQuote } from "@/lib/quotes";
import { Workout } from "@shared/schema";
import confetti from 'canvas-confetti';
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  onNavigateToWorkout: () => void;
  onEditWorkout?: (workout: Workout) => void;
  refreshTrigger?: number; // Add a prop to trigger refresh
}

export default function Dashboard({ onNavigateToWorkout, onEditWorkout, refreshTrigger }: DashboardProps) {
  const [lastWorkout, setLastWorkout] = useState<Workout | undefined>();
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [proteinGoal, setProteinGoal] = useState(120);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [currentProtein, setCurrentProtein] = useState(0);
  const [currentWater, setCurrentWater] = useState(0);
  const [assessmentExercise1, setAssessmentExercise1] = useState("Push-ups");
  const [assessmentExercise2, setAssessmentExercise2] = useState("Pull-ups");
  const [exercise1Reps, setExercise1Reps] = useState("");
  const [exercise2Reps, setExercise2Reps] = useState("");
  const dailyQuote = getDailyQuote();
  const { toast } = useToast();

  // Get current week identifier
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return `${now.getFullYear()}-W${Math.ceil((days + startOfYear.getDay() + 1) / 7)}`;
  };

  // Check if assessment already done this week
  const [weeklyAssessmentDone, setWeeklyAssessmentDone] = useState(false);

  useEffect(() => {
    const currentWeek = getCurrentWeek();
    const existingResults = JSON.parse(localStorage.getItem('assessment_results') || '[]');
    const weekDone = existingResults.some((r: any) => r.week === currentWeek);
    setWeeklyAssessmentDone(weekDone);
  }, []);

  // Save assessment results
  const saveAssessmentResults = () => {
    const currentWeek = getCurrentWeek();
    const results = {
      week: currentWeek,
      date: new Date().toISOString().split('T')[0],
      exercise1: assessmentExercise1,
      exercise1Reps: parseInt(exercise1Reps) || 0,
      exercise2: assessmentExercise2,
      exercise2Reps: parseInt(exercise2Reps) || 0
    };
    
    const existingResults = JSON.parse(localStorage.getItem('assessment_results') || '[]');
    const weekIndex = existingResults.findIndex((r: any) => r.week === currentWeek);
    
    if (weekIndex >= 0) {
      existingResults[weekIndex] = results;
    } else {
      existingResults.push(results);
    }
    
    localStorage.setItem('assessment_results', JSON.stringify(existingResults));
    setWeeklyAssessmentDone(true);
    
    toast({
      title: "Weekly assessment saved",
      description: `${assessmentExercise1}: ${exercise1Reps}, ${assessmentExercise2}: ${exercise2Reps}`
    });
    
    setExercise1Reps("");
    setExercise2Reps("");
  };

  const refreshData = () => {
    setLastWorkout(storage.getLastWorkout());
    setWorkoutDays(storage.getWorkoutDays());
    
    // Load nutrition data
    const savedSettings = localStorage.getItem('trainlog_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setProteinGoal(settings.proteinGoal || 120);
        setWaterGoal(settings.waterGoal || 3.0);
        setAssessmentExercise1(settings.assessmentExercise1 || "Push-ups");
        setAssessmentExercise2(settings.assessmentExercise2 || "Pull-ups");
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    // Load today's nutrition data
    const today = new Date().toISOString().split('T')[0];
    const nutritionData = localStorage.getItem(`nutrition_${today}`);
    if (nutritionData) {
      try {
        const data = JSON.parse(nutritionData);
        setCurrentProtein(data.protein || 0);
        setCurrentWater(data.water || 0);
      } catch (error) {
        console.error('Error loading nutrition data:', error);
      }
    }
    
    // Check if there's a workout completed today and we haven't shown congrats yet
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

      {/* Nutrition Tracking Circle Charts */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Protein Circle Chart */}
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-primary">Protein</h3>
              <Dumbbell className="text-accent-red" size={16} />
            </div>
            <div className="relative w-20 h-20 mx-auto mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: Math.min(currentProtein, proteinGoal), fill: '#dc2626' },
                      { value: Math.max(0, proteinGoal - currentProtein), fill: '#374151' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-text-primary">
                  {Math.round((currentProtein / proteinGoal) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-accent-red">{currentProtein}g</div>
              <div className="text-xs text-text-secondary">of {proteinGoal}g</div>
            </div>
          </div>

          {/* Water Circle Chart */}
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-primary">Water</h3>
              <Droplets className="text-blue-400" size={16} />
            </div>
            <div className="relative w-20 h-20 mx-auto mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: Math.min(currentWater, waterGoal), fill: '#3b82f6' },
                      { value: Math.max(0, waterGoal - currentWater), fill: '#374151' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-text-primary">
                  {Math.round((currentWater / waterGoal) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-400">{currentWater}L</div>
              <div className="text-xs text-text-secondary">of {waterGoal}L</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Day Section */}
      <div className="px-4 pb-4">
        <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Weekly Assessment
            </h2>
          </div>
          
          {weeklyAssessmentDone ? (
            <div className="text-center py-4">
              <div className="text-accent-red mb-2">✓</div>
              <p className="text-text-secondary text-sm">Weekly assessment completed!</p>
              <p className="text-text-secondary text-xs mt-1">Come back next week for your next assessment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">{assessmentExercise1}</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={exercise1Reps}
                    onChange={(e) => setExercise1Reps(e.target.value)}
                    className="mt-1 bg-dark-elevated border-dark-border text-text-primary"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-text-secondary">{assessmentExercise2}</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={exercise2Reps}
                    onChange={(e) => setExercise2Reps(e.target.value)}
                    className="mt-1 bg-dark-elevated border-dark-border text-text-primary"
                  />
                </div>
              </div>
              
              <Button
                onClick={saveAssessmentResults}
                disabled={!exercise1Reps || !exercise2Reps}
                className="w-full bg-accent-red hover:bg-accent-light-red text-white disabled:opacity-50"
              >
                Save Weekly Assessment
              </Button>
            </div>
          )}
        </div>
      </div>

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
              
              {onEditWorkout && (
                <Button
                  onClick={() => onEditWorkout(lastWorkout)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 bg-dark-elevated border-dark-border text-text-secondary hover:text-accent-red"
                >
                  Edit Workout
                </Button>
              )}
            </div>
          ) : (
            <p className="text-text-secondary">No workouts logged yet. Start your first workout!</p>
          )}
        </div>
      </div>


    </div>
  );
}
