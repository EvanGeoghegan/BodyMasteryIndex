import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Calendar, Target, BarChart3, Activity } from "lucide-react";
import { storage } from "@/lib/storage";
import { Workout, PersonalBest } from "@shared/schema";
import { Button } from "@/components/ui/button";
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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";

interface ProgressData {
  date: string;
  totalVolume: number;
  exerciseCount: number;
  maxWeight: number;
  workoutDuration: number;
}

interface ExerciseProgress {
  exerciseName: string;
  data: Array<{
    date: string;
    weight: number;
    reps: number;
    volume: number;
  }>;
}

export default function ProgressDashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("30");
  const [selectedExercise, setSelectedExercise] = useState<string>("all");
  const [chartType, setChartType] = useState<string>("volume");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedWorkouts = storage.getWorkouts();
    const loadedPersonalBests = storage.getPersonalBests();
    setWorkouts(loadedWorkouts);
    setPersonalBests(loadedPersonalBests);
  };

  // Filter data based on timeframe
  const filteredWorkouts = useMemo(() => {
    const days = parseInt(selectedTimeframe);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return workouts.filter(workout => new Date(workout.date) >= cutoffDate);
  }, [workouts, selectedTimeframe]);

  // Calculate progress data for charts
  const progressData = useMemo(() => {
    const dataMap = new Map<string, ProgressData>();
    
    filteredWorkouts.forEach(workout => {
      const date = workout.date.split('T')[0];
      const totalVolume = workout.exercises.reduce((sum, exercise) => {
        return sum + exercise.sets.reduce((setSum, set) => {
          if (set.completed && set.weight && set.reps) {
            return setSum + (set.weight * set.reps);
          }
          return setSum;
        }, 0);
      }, 0);
      
      const maxWeight = workout.exercises.reduce((max, exercise) => {
        const exerciseMax = exercise.sets.reduce((setMax, set) => {
          return set.weight ? Math.max(setMax, set.weight) : setMax;
        }, 0);
        return Math.max(max, exerciseMax);
      }, 0);
      
      const exerciseCount = workout.exercises.length;
      const estimatedDuration = workout.exercises.length * 15; // Rough estimate
      
      dataMap.set(date, {
        date,
        totalVolume,
        exerciseCount,
        maxWeight,
        workoutDuration: estimatedDuration
      });
    });
    
    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredWorkouts]);

  // Get unique exercises for selection
  const uniqueExercises = useMemo(() => {
    const exercises = new Set<string>();
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.type === 'strength') {
          exercises.add(exercise.name);
        }
      });
    });
    return Array.from(exercises).sort();
  }, [workouts]);

  // Calculate exercise-specific progress
  const exerciseProgressData = useMemo(() => {
    if (selectedExercise === "all") return [];
    
    const progressMap = new Map<string, any>();
    
    filteredWorkouts.forEach(workout => {
      const date = workout.date.split('T')[0];
      const exercise = workout.exercises.find(ex => ex.name === selectedExercise);
      
      if (exercise && exercise.type === 'strength') {
        const completedSets = exercise.sets.filter(set => set.completed && set.weight && set.reps);
        let bestSet = null;
        if (completedSets.length > 0) {
          bestSet = completedSets[0];
          for (const set of completedSets) {
            const volume = (set.weight || 0) * (set.reps || 0);
            const bestVolume = (bestSet.weight || 0) * (bestSet.reps || 0);
            if (volume > bestVolume) {
              bestSet = set;
            }
          }
        }
        
        if (bestSet) {
          progressMap.set(date, {
            date,
            weight: bestSet.weight,
            reps: bestSet.reps,
            volume: (bestSet.weight || 0) * (bestSet.reps || 0)
          });
        }
      }
    });
    
    return Array.from(progressMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredWorkouts, selectedExercise]);

  // Calculate workout frequency data
  const workoutFrequencyData = useMemo(() => {
    const dayMap = new Map<string, number>();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    dayNames.forEach(day => dayMap.set(day, 0));
    
    filteredWorkouts.forEach(workout => {
      const dayOfWeek = dayNames[new Date(workout.date).getDay()];
      dayMap.set(dayOfWeek, (dayMap.get(dayOfWeek) || 0) + 1);
    });
    
    return dayNames.map(day => ({
      day,
      workouts: dayMap.get(day) || 0
    }));
  }, [filteredWorkouts]);

  // Calculate muscle group distribution
  const muscleGroupData = useMemo(() => {
    const muscleGroups = new Map<string, number>();
    
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        // Simple categorization based on exercise name
        let category = 'Other';
        const name = exercise.name.toLowerCase();
        
        if (name.includes('bench') || name.includes('chest') || name.includes('push')) {
          category = 'Chest';
        } else if (name.includes('squat') || name.includes('leg') || name.includes('quad')) {
          category = 'Legs';
        } else if (name.includes('deadlift') || name.includes('row') || name.includes('pull')) {
          category = 'Back';
        } else if (name.includes('shoulder') || name.includes('press') || name.includes('lateral')) {
          category = 'Shoulders';
        } else if (name.includes('curl') || name.includes('tricep') || name.includes('arm')) {
          category = 'Arms';
        }
        
        muscleGroups.set(category, (muscleGroups.get(category) || 0) + exercise.sets.length);
      });
    });
    
    return Array.from(muscleGroups.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredWorkouts]);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateStats = () => {
    const totalWorkouts = filteredWorkouts.length;
    const totalVolume = progressData.reduce((sum, data) => sum + data.totalVolume, 0);
    const avgVolume = totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0;
    const maxVolume = Math.max(...progressData.map(data => data.totalVolume), 0);
    
    return { totalWorkouts, totalVolume, avgVolume, maxVolume };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      <header className="bg-dark-secondary p-4 shadow-lg">
        <h2 className="text-xl font-bold text-text-primary flex items-center">
          <BarChart3 className="mr-2 text-accent-navy" size={24} />
          Progress Dashboard
        </h2>
      </header>

      {/* Controls */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-text-secondary text-sm font-medium mb-2 block">Timeframe</label>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="bg-dark-secondary border-dark-border text-dropdown-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-dark-border" style={{ backgroundColor: 'hsl(220, 20%, 12%)', color: 'white' }}>
                <SelectItem value="7" style={{ color: 'white' }}>Last 7 days</SelectItem>
                <SelectItem value="30" style={{ color: 'white' }}>Last 30 days</SelectItem>
                <SelectItem value="90" style={{ color: 'white' }}>Last 3 months</SelectItem>
                <SelectItem value="365" style={{ color: 'white' }}>Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-text-secondary text-sm font-medium mb-2 block">Exercise</label>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="bg-dark-secondary border-dark-border text-dropdown-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-dark-border" style={{ backgroundColor: 'hsl(220, 20%, 12%)', color: 'white' }}>
                <SelectItem value="all" style={{ color: 'white' }}>All Exercises</SelectItem>
                {uniqueExercises.map(exercise => (
                  <SelectItem key={exercise} value={exercise} style={{ color: 'white' }}>{exercise}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-text-secondary text-sm font-medium mb-2 block">Chart Type</label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="bg-dark-secondary border-dark-border text-dropdown-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-dark-border" style={{ backgroundColor: 'hsl(220, 20%, 12%)', color: 'white' }}>
                <SelectItem value="volume" style={{ color: 'white' }}>Volume Progress</SelectItem>
                <SelectItem value="weight" style={{ color: 'white' }}>Weight Progress</SelectItem>
                <SelectItem value="frequency" style={{ color: 'white' }}>Workout Frequency</SelectItem>
                <SelectItem value="distribution" style={{ color: 'white' }}>Muscle Groups</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border shadow-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="text-accent-red" size={20} />
              <div>
                <p className="text-text-secondary text-sm">Total Workouts</p>
                <p className="text-text-primary text-lg font-bold">{stats.totalWorkouts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border shadow-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="text-accent-green" size={20} />
              <div>
                <p className="text-text-secondary text-sm">Total Volume</p>
                <p className="text-text-primary text-lg font-bold">{stats.totalVolume.toLocaleString()}kg</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border shadow-lg">
            <div className="flex items-center space-x-3">
              <Target className="text-accent-light-red" size={20} />
              <div>
                <p className="text-text-secondary text-sm">Avg Volume</p>
                <p className="text-text-primary text-lg font-bold">{stats.avgVolume.toLocaleString()}kg</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border shadow-lg">
            <div className="flex items-center space-x-3">
              <Activity className="text-accent-red" size={20} />
              <div>
                <p className="text-text-secondary text-sm">Best Session</p>
                <p className="text-text-primary text-lg font-bold">{stats.maxVolume.toLocaleString()}kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="px-4 pb-4">
        {chartType === "volume" && (
          <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Volume Progress</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#9ca3af"
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalVolume" 
                    stroke="#2563eb" 
                    fill="#2563eb"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartType === "weight" && selectedExercise !== "all" && (
          <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Weight Progress - {selectedExercise}
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#9ca3af"
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartType === "frequency" && (
          <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Workout Frequency by Day</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar dataKey="workouts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartType === "distribution" && (
          <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Muscle Group Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={muscleGroupData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {muscleGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartType === "weight" && selectedExercise === "all" && (
          <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border shadow-lg text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Weight Progress</h3>
            <p className="text-text-secondary">Please select a specific exercise to view weight progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}