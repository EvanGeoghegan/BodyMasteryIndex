import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Quote, History, Plus, Minus, Sparkles, Droplets, Target, Home, Edit, Bed, MessageSquare, Save } from "lucide-react";
import logoPath from '@/assets/logo.png';

import { storage } from "@/lib/storage";
import { getMotivationalQuote } from "@/lib/quotes";
import { Workout, RecoveryScore } from "@shared/schema";
import confetti from 'canvas-confetti';
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface DashboardProps {
  onNavigateToWorkout: () => void;
  onEditWorkout?: (workout: Workout) => void;
  refreshTrigger?: number;
  onNavigateToNutrition?: () => void;
}

export default function Dashboard({ onNavigateToWorkout, onEditWorkout, refreshTrigger, onNavigateToNutrition }: DashboardProps) {
  const [lastWorkout, setLastWorkout] = useState<Workout | undefined>();
  const [proteinGoal, setProteinGoal] = useState(120);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [currentProtein, setCurrentProtein] = useState(0);
  const [currentWater, setCurrentWater] = useState(0);
  const [assessmentExercise1, setAssessmentExercise1] = useState("Push-ups");
  const [assessmentExercise2, setAssessmentExercise2] = useState("Pull-ups");
  const [exercise1Reps, setExercise1Reps] = useState("");
  const [exercise2Reps, setExercise2Reps] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);
  const [weeklyAssessmentDone, setWeeklyAssessmentDone] = useState(false);
  const { toast } = useToast();

  const getDaysSinceLastWorkout = (): number => {
    if (!lastWorkout) return 999;
    const lastWorkoutDate = new Date(lastWorkout.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastWorkoutDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSinceLastWorkout = getDaysSinceLastWorkout();
  const motivationalQuote = getMotivationalQuote(daysSinceLastWorkout);

  // ADD THESE NEW STATE HOOKS AND HANDLER FUNCTION
  const [todaysRecovery, setTodaysRecovery] = useState<RecoveryScore | null>(null);
  const [recoveryScore, setRecoveryScore] = useState(5);
  const [recoveryNotes, setRecoveryNotes] = useState("");

  useEffect(() => {
    // This will run when the component loads to check for today's score
    const today = new Date().toISOString().split('T')[0];
    const scores = storage.getRecoveryScores();
    const todaysScore = scores.find(s => s.date === today) || null;
    setTodaysRecovery(todaysScore);
    if (todaysScore) {
      setRecoveryScore(todaysScore.score);
      setRecoveryNotes(todaysScore.notes || "");
    }
  }, []);

  const handleSaveRecovery = () => {
    const today = new Date().toISOString().split('T')[0];
    const scoreToSave = {
      date: today,
      score: recoveryScore,
      notes: recoveryNotes,
    };
    const saved = storage.saveRecoveryScore(scoreToSave);
    setTodaysRecovery(saved);
    toast({
      title: "Recovery Logged",
      description: `Your score of ${recoveryScore}/10 has been saved.`,
    });
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return `${now.getFullYear()}-W${Math.ceil((days + startOfYear.getDay() + 1) / 7)}`;
  };

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
    const savedSettings = localStorage.getItem('bmi_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setProteinGoal(settings.proteinGoal || 120);
        setWaterGoal(settings.waterGoal || 3.0);
        setAssessmentExercise1(settings.assessmentExercise1 || "Push-ups");
        setAssessmentExercise2(settings.assessmentExercise2 || "Pull-ups");
      } catch (error) { console.error('Error loading settings:', error); }
    }
    const today = new Date().toISOString().split('T')[0];
    const nutritionData = localStorage.getItem(`nutrition_${today}`);
    if (nutritionData) {
      try {
        const data = JSON.parse(nutritionData);
        setCurrentProtein(data.protein || 0);
        setCurrentWater(data.water || 0);
      } catch (error) { console.error('Error loading nutrition data:', error); }
    }
    const currentWeek = getCurrentWeek();
    const existingResults = JSON.parse(localStorage.getItem('assessment_results') || '[]');
    const weekDone = existingResults.some((r: any) => r.week === currentWeek);
    setWeeklyAssessmentDone(weekDone);

    const todayWorkouts = storage.getWorkouts().filter(workout => workout.date.split('T')[0] === today);
    const lastCongratsDate = localStorage.getItem('lastCongratsDate');
    const congratsDismissedDate = localStorage.getItem('congratsDismissedDate');
    const hasShownCongratsToday = lastCongratsDate === today;
    const wasDismissedToday = congratsDismissedDate === today;

    if (todayWorkouts.length > 0 && !hasShownCongratsToday && !wasDismissedToday) {
      setShowCongrats(true);
      localStorage.setItem('lastCongratsDate', today);
    }
  };

  const triggerCelebration = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  useEffect(() => {
    refreshData();
  }, [refreshTrigger]);

  useEffect(() => {
    if (showCongrats) {
      triggerCelebration();
    }
  }, [showCongrats]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getCurrentDate = (): string => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-dark-primary text-text-primary pb-20">
      <header className="bg-dark-secondary p-2 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left side: Standalone Page Icon + Title */}
          <div className="flex items-center">
            <Home className="text-accent-red mr-4" size={28} />
            <div>
              <h2 className="text-xl font-bold text-text-primary font-heading">
                Dashboard
              </h2>
              <p className="text-text-secondary mt-1">Your daily overview</p>
            </div>
          </div>

          {/* Right side: App Logo */}
          <div className="w-14 h-14 bg-dark-elevated rounded-full flex items-center justify-center overflow-hidden border-2 border-dark-border flex-shrink-0">
            {/* The key change here is adding rounded-full to the image itself */}
            <img
              src="/assets/logo.png"
              alt="Body Mastery Index Icon"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </header>

      

      <div className="p-4 space-y-4">
      <div className="bg-gradient-to-br from-dark-secondary to-dark-elevated rounded-xl p-6 border border-dark-border shadow-lg">
          <p className="text-text-primary text-base italic leading-relaxed font-medium">"{motivationalQuote.text}"</p>
          <p className="text-accent-red text-sm mt-4 font-medium">— {motivationalQuote.author}</p>
          {daysSinceLastWorkout >= 3 && (<div className="mt-3 px-3 py-2 bg-accent-red/10 border border-accent-red/20 rounded-lg"><p className="text-accent-red text-xs font-medium">{daysSinceLastWorkout === 999 ? "No workouts logged yet" : `${daysSinceLastWorkout} days since last workout`}</p></div>)}
        </div>
    {/* The rest of your dashboard content follows... */}
        {showCongrats && (
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 border border-green-500/30 shadow-lg">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="text-green-400 mr-2" size={24} />
              <h2 className="text-xl font-bold text-green-400">Congratulations!</h2>
              <Sparkles className="text-green-400 ml-2" size={24} />
            </div>
            <p className="text-text-primary text-center font-medium">
              You've completed a workout today! Keep up the great work.
            </p>
            <Button
              onClick={() => {
                setShowCongrats(false);
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem('congratsDismissedDate', today);
              }}
              variant="ghost"
              className="w-full mt-4 text-green-400 hover:text-green-300 hover:bg-green-500/10"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border cursor-pointer hover:bg-dark-elevated transition-colors" onClick={() => onNavigateToNutrition?.()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-primary">Protein</h3>
              <img src={logoPath} alt="Protein" className="w-4 h-4 object-contain" />
            </div>
            <div className="relative w-20 h-20 mx-auto mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ value: Math.min(currentProtein, proteinGoal || 1), fill: 'var(--accent-red)' }, { value: Math.max(0, (proteinGoal || 1) - currentProtein), fill: 'var(--dark-elevated)' }]} cx="50%" cy="50%" innerRadius={25} outerRadius={40} startAngle={90} endAngle={-270} dataKey="value" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-text-primary">{Math.round((currentProtein / (proteinGoal || 1)) * 100)}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-accent-red">{currentProtein}g</div>
              <div className="text-xs text-text-secondary">of {proteinGoal}g</div>
            </div>
          </div>

          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border cursor-pointer hover:bg-dark-elevated transition-colors" onClick={() => onNavigateToNutrition?.()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-primary">Water</h3>
              <Droplets className="text-blue-400" size={16} />
            </div>
            <div className="relative w-20 h-20 mx-auto mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ value: Math.min(currentWater, waterGoal || 1), fill: 'hsl(210, 80%, 60%)' }, { value: Math.max(0, (waterGoal || 1) - currentWater), fill: 'var(--dark-elevated)' }]} cx="50%" cy="50%" innerRadius={25} outerRadius={40} startAngle={90} endAngle={-270} dataKey="value" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-text-primary">{Math.round((currentWater / (waterGoal || 1)) * 100)}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-400">{currentWater}L</div>
              <div className="text-xs text-text-secondary">of {waterGoal}L</div>
            </div>
          </div>
        </div>

        <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Weekly Assessment</h2>
          </div>
          {weeklyAssessmentDone ? (
            <div className="text-center py-4"><div className="text-accent-green mb-2">✓</div><p className="text-text-secondary text-sm">Weekly assessment completed!</p><p className="text-text-secondary text-xs mt-1">Come back next week.</p></div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-text-secondary">{assessmentExercise1}</label><Input type="number" placeholder="0" value={exercise1Reps} onChange={(e) => setExercise1Reps(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" /></div>
                <div><label className="text-sm font-medium text-text-secondary">{assessmentExercise2}</label><Input type="number" placeholder="0" value={exercise2Reps} onChange={(e) => setExercise2Reps(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" /></div>
              </div>
              <Button onClick={saveAssessmentResults} disabled={!exercise1Reps || !exercise2Reps} className="w-full bg-accent-red text-white disabled:opacity-50">Save Weekly Assessment</Button>
            </div>
          )}
        </div>
         {/* UPDATED RECOVERY CARD */}
          <Card className="col-span-2 bg-dark-secondary border-dark-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                {/* Changed icon color to red */}
                <Bed className="w-6 h-6 text-accent-red" />
                <div>
                  <CardTitle className="text-lg font-semibold text-text-primary font-heading">Daily Recovery</CardTitle>
                  <p className="text-sm text-text-secondary">Rate your readiness for the day.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {todaysRecovery ? (
                // View to show if score is already logged for today
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary font-medium">Today's Score:</span>
                    <span className="text-2xl font-bold text-accent-red">{todaysRecovery.score}<span className="text-sm text-text-secondary">/10</span></span>
                  </div>
                  {todaysRecovery.notes && (
                    <div className="text-sm text-text-secondary border-l-2 border-dark-border pl-3">
                      {todaysRecovery.notes}
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setTodaysRecovery(null)} className="w-full">
                    Edit Score
                  </Button>
                </div>
              ) : (
                // View to show if score has NOT been logged yet
                <div className="space-y-4">
                  {/* Smaller Circular Input */}
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setRecoveryScore(s => Math.max(1, s - 1))}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="relative w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[{ value: recoveryScore, fill: 'var(--accent-red)' }, { value: 10 - recoveryScore, fill: 'var(--dark-elevated)' }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={32}
                            outerRadius={45}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-accent-red">{recoveryScore}</span>
                        <span className="text-xs text-text-secondary -mt-1">/ 10</span>
                      </div>
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setRecoveryScore(s => Math.min(10, s + 1))}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-text-disabled" />
                    <Input
                      type="text"
                      placeholder="Optional notes..."
                      value={recoveryNotes}
                      onChange={(e) => setRecoveryNotes(e.target.value)}
                      className="pl-9 bg-dark-elevated border-dark-border text-sm h-10"
                    />
                  </div>
                  <Button onClick={handleSaveRecovery} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Recovery Score
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        <div className="bg-dark-secondary rounded-xl p-5 border border-dark-border shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center"><History className="text-accent-red mr-2" size={20} />Last Activity</h3>
          {lastWorkout ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-text-secondary">Workout</span><span className="text-text-primary font-medium">{lastWorkout.name}</span></div>
              <div className="flex justify-between items-center"><span className="text-text-secondary">Date</span><span className="text-text-primary font-medium">{formatDate(lastWorkout.date)}</span></div>
              <div className="flex justify-between items-center"><span className="text-text-secondary">Exercises</span><span className="text-text-primary font-medium">{lastWorkout.exercises.length} exercises</span></div>
              {onEditWorkout && (<Button onClick={() => onEditWorkout(lastWorkout)} variant="secondary" size="sm" className="w-full mt-3 bg-dark-elevated border-dark-border text-text-secondary hover:text-accent-red">Edit Workout</Button>)}
            </div>
          ) : (<p className="text-text-secondary">No workouts logged yet. Start your first workout!</p>)}
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button onClick={onNavigateToWorkout} className="w-full bg-accent-red text-white font-medium py-4 px-4 rounded-xl shadow-lg border border-transparent transition-all duration-200 hover:shadow-xl hover:scale-105">
          <span>Log Workout</span>
        </Button>
      </div>
    </div>
  );
}