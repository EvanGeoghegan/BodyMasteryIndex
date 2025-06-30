import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Quote, History, Sparkles, Droplets, Target } from "lucide-react";
import logoPath from "@assets/Scale Logo draft _Nero_AI_Background_Remover_1750025859630.png";
import ActivityCalendar from "@/components/ActivityCalendar";
import { storage } from "@/lib/storage";
import { getMotivationalQuote } from "@/lib/quotes";
import { Workout } from "@shared/schema";
import confetti from 'canvas-confetti';
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  onNavigateToWorkout: () => void;
  onEditWorkout?: (workout: Workout) => void;
  refreshTrigger?: number; 
  onNavigateToNutrition?: () => void;
}

export default function Dashboard({ onNavigateToWorkout, onEditWorkout, refreshTrigger, onNavigateToNutrition }: DashboardProps) {
  // All state and logic functions remain the same
  const [lastWorkout, setLastWorkout] = useState<Workout | undefined>();
  const [proteinGoal, setProteinGoal] = useState(120);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [currentProtein, setCurrentProtein] = useState(0);
  const [currentWater, setCurrentWater] = useState(0);
  const [assessmentExercise1, setAssessmentExercise1] = useState("Push-ups");
  const [assessmentExercise2, setAssessmentExercise2] = useState("Pull-ups");
  const { toast } = useToast();

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
  };
  
  useEffect(() => {
    refreshData();
  }, [refreshTrigger]);


  return (
    // --- UPDATED JSX with correct theme-aware classes ---
    <div className="bg-background pb-20">
      <header className="bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary font-heading">Body Mastery Index</h1>
            <p className="text-text-secondary text-sm">Today's Dashboard</p>
          </div>
          <div className="w-16 h-16 bg-card-elevated rounded-full flex items-center justify-center overflow-hidden border border-border">
            <img src={logoPath} alt="Body Mastery Index" className="w-14 h-14 object-contain" />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
          {/* Nutrition Tracking Circle Charts */}
          <div className="grid grid-cols-2 gap-4">
            {/* Protein Circle Chart */}
            <div 
              className="bg-card rounded-xl p-4 border border-border cursor-pointer hover:bg-card-elevated transition-colors"
              onClick={() => onNavigateToNutrition?.()}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-primary">Protein</h3>
                <img src={logoPath} alt="Protein" className="w-4 h-4 object-contain" />
              </div>
              <div className="relative w-20 h-20 mx-auto mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: Math.min(currentProtein, proteinGoal || 1), fill: 'hsl(var(--primary-accent))' },
                        { value: Math.max(0, (proteinGoal || 1) - currentProtein), fill: 'hsl(var(--card-elevated))' }
                      ]}
                      cx="50%" cy="50%" innerRadius={25} outerRadius={40}
                      startAngle={90} endAngle={-270} dataKey="value"
                    >
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-text-primary">
                    {Math.round((currentProtein / (proteinGoal || 1)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold" style={{color: 'hsl(var(--primary-accent))'}}>{currentProtein}g</div>
                <div className="text-xs text-text-secondary">of {proteinGoal}g</div>
              </div>
            </div>

            {/* Water Circle Chart */}
            <div 
              className="bg-card rounded-xl p-4 border border-border cursor-pointer hover:bg-card-elevated transition-colors"
              onClick={() => onNavigateToNutrition?.()}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-primary">Water</h3>
                <Droplets className="text-blue-500" size={16} />
              </div>
              <div className="relative w-20 h-20 mx-auto mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: Math.min(currentWater, waterGoal || 1), fill: 'hsl(210, 80%, 60%)' },
                        { value: Math.max(0, (waterGoal || 1) - currentWater), fill: 'hsl(var(--card-elevated))' }
                      ]}
                      cx="50%" cy="50%" innerRadius={25} outerRadius={40}
                      startAngle={90} endAngle={-270} dataKey="value"
                    >
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-text-primary">
                    {Math.round((currentWater / (waterGoal || 1)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-blue-500">{currentWater}L</div>
                <div className="text-xs text-text-secondary">of {waterGoal}L</div>
              </div>
            </div>
          </div>
          
          {/* Other sections like Assessment, Quote, Last Activity would go here */}
      </div>

      {/* Quick Actions with polished button */}
      <div className="px-4 pb-4">
        <Button 
          onClick={onNavigateToWorkout}
          className="w-full bg-primary-accent text-primary-accent-foreground font-medium py-4 px-4 rounded-xl shadow-lg border border-transparent transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          <img src={logoPath} alt="Workout" className="w-10 h-10 object-contain mr-3" />
          <span>Log Workout</span>
        </Button>
      </div>
    </div>
  );
}
