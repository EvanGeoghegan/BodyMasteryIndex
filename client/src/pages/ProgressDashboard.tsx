import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Weight, Percent, BarChart3, Trophy } from "lucide-react";
import { storage } from "@/lib/storage";
import { Workout, PersonalBest } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  Legend
} from "recharts";
import masterExerciseList from "@/lib/exercises.json"; // Import the exercise database
import WeeklyAssessmentReport from "@/components/WeeklyAssessmentReport";
import PageHeader from "@/components/PageHeader";
import { getDisplayWeekRange, fmtYYYYMMDD } from "@/lib/date";


// Data structure for body composition history
interface BodyCompData {
  date: string;
  weight?: number;
  bodyFat?: number;
}

export default function ProgressDashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);
  const [bodyCompHistory, setBodyCompHistory] = useState<BodyCompData[]>([]);
  const [settings, setSettings] = useState<any>({});
  // --- UPDATED: State for the three-level filter ---
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedPbExercise1, setSelectedPbExercise1] = useState<string>('none');
  const [selectedPbExercise2, setSelectedPbExercise2] = useState<string>('none'); // For comparison
  const [showWeekly, setShowWeekly] = useState(false);

  useEffect(() => {
    loadData();
    const handleVisibilityChange = () => {
      if (!document.hidden) loadData();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadData = () => {
    try {
      setWorkouts(storage.getWorkouts());
      setPersonalBests(storage.getPersonalBests());
      const history = JSON.parse(localStorage.getItem('body_composition_history') || '[]');
      setBodyCompHistory(history);
      const savedSettings = JSON.parse(localStorage.getItem('bmi_settings') || '{}');
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const { start, end } = getDisplayWeekRange();
  const dateLabel = `${start.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })} → ${end.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}`;

  const kpiStats = useMemo(() => {
    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, workout) => sum + workout.exercises.reduce((exSum, ex) => exSum + ex.sets.reduce((setSum, set) => set.completed && set.weight && set.reps ? setSum + (set.weight * set.reps) : setSum, 0), 0), 0);
    const workoutDates = workouts.map(w => new Date(w.date));
    let streak = 0;
    if (workoutDates.length > 0) {
      const sortedDates = workoutDates.sort((a, b) => b.getTime() - a.getTime());
      const today = new Date();
      let currentWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      currentWeek.setHours(0, 0, 0, 0);
      while (true) {
        const workoutsInWeek = sortedDates.some(d => {
          const dateWeek = new Date(d.setDate(d.getDate() - d.getDay()));
          dateWeek.setHours(0, 0, 0, 0);
          return dateWeek.getTime() === currentWeek.getTime();
        });
        if (workoutsInWeek) {
          streak++;
          currentWeek.setDate(currentWeek.getDate() - 7);
        } else {
          break;
        }
      }
    }
    return { totalWorkouts, totalVolume, streak };
  }, [workouts]);

  const weeklyVolumeData = useMemo(() => {
    const weeklyMap = new Map<string, number>();
    workouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      const workoutVolume = workout.exercises.reduce((sum, ex) => sum + ex.sets.reduce((setSum, set) => set.completed && set.weight && set.reps ? setSum + (set.weight * set.reps) : setSum, 0), 0);
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + workoutVolume);
    });
    return Array.from(weeklyMap.entries()).map(([date, volume]) => ({ date, volume })).sort((a, b) => a.date.localeCompare(b.date));
  }, [workouts]);

  // --- FIX: Logic to correctly extract muscle groups ---
  const muscleGroupOptions = useMemo(() => {
    const exerciseNamesWithPbs = new Set(personalBests.map(pb => pb.exerciseName));
    const groups = new Set<string>();
    masterExerciseList.forEach(exercise => {
      if (exerciseNamesWithPbs.has(exercise.name)) {
        // Extracts the text part of the ID, e.g., "chest001" -> "chest"
        const muscleGroup = exercise.id.replace(/[0-9]/g, '');
        if (muscleGroup) {
          groups.add(muscleGroup);
        }
      }
    });
    return Array.from(groups).sort();
  }, [personalBests]);

  const pbExerciseOptions = useMemo(() => {
    if (selectedMuscleGroup === 'all') {
      const names = new Set(personalBests.map(pb => pb.exerciseName));
      return Array.from(names).sort();
    }
    const exerciseNamesWithPbs = new Set(personalBests.map(pb => pb.exerciseName));
    return masterExerciseList
      .filter(ex => ex.id.startsWith(selectedMuscleGroup) && exerciseNamesWithPbs.has(ex.name))
      .map(ex => ex.name)
      .sort();
  }, [personalBests, selectedMuscleGroup]);

  // --- NEW: Logic to merge data for comparison chart ---
  const comparisonChartData = useMemo(() => {
    if (selectedPbExercise1 === 'none') return [];

    const getHistory = (exerciseName: string) => {
      return personalBests
        .filter(pb => pb.exerciseName === exerciseName)
        .map(pb => ({
          date: pb.date.split('T')[0], // Use only the date part for grouping
          e1RM: Math.round(pb.weight * (1 + pb.reps / 30))
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };

    const history1 = getHistory(selectedPbExercise1);
    const history2 = selectedPbExercise2 !== 'none' ? getHistory(selectedPbExercise2) : [];

    const allDates = new Set([...history1.map(h => h.date), ...history2.map(h => h.date)]);
    const sortedDates = Array.from(allDates).sort();

    let lastVal1: number | null = null;
    let lastVal2: number | null = null;

    return sortedDates.map(date => {
      const point1 = history1.find(h => h.date === date);
      const point2 = history2.find(h => h.date === date);

      if (point1) lastVal1 = point1.e1RM;
      if (point2) lastVal2 = point2.e1RM;

      return {
        date,
        [selectedPbExercise1]: point1 ? point1.e1RM : lastVal1,
        [selectedPbExercise2]: point2 ? point2.e1RM : lastVal2,
      };
    });
  }, [personalBests, selectedPbExercise1, selectedPbExercise2]);

  return (
    <div className="bg-dark-primary pb-20">
      <PageHeader
        icon={<BarChart3 className="text-accent-red mr-4" size={28} />}
        title="Progress"
        subtitle="Visualize your journey."
      />

      <div className="p-4 space-y-6">
        {/* KPI Cards (unchanged) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border text-center">
            <p className="text-3xl font-bold text-accent-red">{kpiStats.totalWorkouts}</p>
            <p className="text-xs text-text-secondary mt-1">Total Workouts</p>
          </div>
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border text-center">
            <p className="text-3xl font-bold text-accent-red">{kpiStats.streak}</p>
            <p className="text-xs text-text-secondary mt-1">Workout Streak</p>
          </div>
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border text-center">
            <p className="text-3xl font-bold text-accent-red">{(kpiStats.totalVolume / 1000).toFixed(1)}k</p>
            <p className="text-xs text-text-secondary mt-1">Total Volume (kg)</p>
          </div>
        </div>
{/* Toggle Button */}
        <div className="text-center mt-4">
          <button
            onClick={() => setShowWeekly((v) => !v)}
            className="bg-accent-red hover:bg-accent-red/90 text-white font-semibold py-2 px-4 rounded"
          >
            {showWeekly ? "Back to Charts" : "Weekly Summary"}
          </button>
        </div>

        {/* Conditional Rendering */}
        {showWeekly ? (
          <WeeklyAssessmentReport />
        ) : (
          <>
            {/* Body Composition Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold text-text-primary font-heading mb-4 flex items-center">
                  <Weight className="mr-2" size={20} />
                  Body Weight
                </h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bodyCompHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                      <XAxis dataKey="date" tickFormatter={formatDate} stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} domain={["dataMin - 2", "dataMax + 2"]} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--dark-elevated)", border: "1px solid var(--dark-border)" }} />
                      <Line type="monotone" dataKey="weight" stroke="var(--accent-red)" strokeWidth={2} dot={{ r: 4 }} />
                      {settings.targetWeight && (
                        <ReferenceLine y={settings.targetWeight} label="Target" stroke="var(--accent-green)" strokeDasharray="4 4" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
                <h3 className="text-lg font-semibold text-text-primary font-heading mb-4 flex items-center">
                  <Percent className="mr-2" size={20} />
                  Body Fat %
                </h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bodyCompHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                      <XAxis dataKey="date" tickFormatter={formatDate} stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} domain={["dataMin - 2", "dataMax + 2"]} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--dark-elevated)", border: "1px solid var(--dark-border)" }} />
                      <Line type="monotone" dataKey="bodyFat" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                      {settings.targetBodyFat && (
                        <ReferenceLine y={settings.targetBodyFat} label="Target" stroke="var(--accent-green)" strokeDasharray="4 4" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Weekly Volume Chart */}
            <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
              <h3 className="text-lg font-semibold text-text-primary font-heading mb-4 flex items-center">
                <TrendingUp className="mr-2" size={20} />
                Weekly Volume
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyVolumeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--dark-elevated)", border: "1px solid var(--dark-border)" }} />
                    <Bar dataKey="volume" fill="var(--accent-red)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Personal Best Progress */}
            <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
              <h3 className="text-lg font-semibold text-text-primary font-heading mb-4 flex items-center">
                <Trophy className="mr-2" size={20} />
                Personal Best Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Select
                  value={selectedMuscleGroup}
                  onValueChange={(v) => {
                    setSelectedMuscleGroup(v);
                    setSelectedPbExercise1("none");
                    setSelectedPbExercise2("none");
                  }}
                >
                  <SelectTrigger className="w-full bg-dark-elevated border-dark-border text-text-primary">
                    <SelectValue placeholder="Select Muscle Group..." />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-secondary border-dark-border">
                    <SelectItem value="all">All Muscle Groups</SelectItem>
                    {muscleGroupOptions.map((g) => (
                      <SelectItem key={g} value={g} className="capitalize">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPbExercise1} onValueChange={setSelectedPbExercise1}>
                  <SelectTrigger className="w-full bg-dark-elevated border-dark-border text-text-primary">
                    <SelectValue placeholder="Select Exercise 1..." />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-secondary border-dark-border">
                    <SelectItem value="none">Select Exercise...</SelectItem>
                    {pbExerciseOptions.map((ex) => (
                      <SelectItem key={ex} value={ex}>
                        {ex}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedPbExercise2}
                  onValueChange={setSelectedPbExercise2}
                  disabled={selectedPbExercise1 === "none"}
                >
                  <SelectTrigger className="w-full bg-dark-elevated border-dark-border text-text-primary">
                    <SelectValue placeholder="Compare with..." />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-secondary border-dark-border">
                    <SelectItem value="none">None</SelectItem>
                    {pbExerciseOptions
                      .filter((ex) => ex !== selectedPbExercise1)
                      .map((ex) => (
                        <SelectItem key={ex} value={ex}>
                          {ex}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPbExercise1 !== "none" && (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparisonChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-border)" />
                      <XAxis dataKey="date" tickFormatter={formatDate} stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} domain={["dataMin - 5", "dataMax + 5"]} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--dark-elevated)", border: "1px solid var(--dark-border)" }} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={selectedPbExercise1}
                        name={selectedPbExercise1}
                        stroke="var(--accent-green)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls
                      />
                      {selectedPbExercise2 !== "none" && (
                        <Line
                          type="monotone"
                          dataKey={selectedPbExercise2}
                          name={selectedPbExercise2}
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          connectNulls
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}