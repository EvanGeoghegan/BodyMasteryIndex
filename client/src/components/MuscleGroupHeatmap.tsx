import { useMemo } from "react";
import { storage } from "@/lib/storage";
import { Workout } from "@shared/schema";

interface MuscleGroupHeatmapProps {
  className?: string;
}

const MUSCLE_GROUPS = [
  { name: "Chest", keywords: ["chest", "bench", "push", "fly", "dip"] },
  { name: "Back", keywords: ["back", "pull", "row", "lat", "deadlift"] },
  { name: "Shoulders", keywords: ["shoulder", "press", "raise", "shrug", "deltoid"] },
  { name: "Arms", keywords: ["bicep", "tricep", "curl", "extension", "arm"] },
  { name: "Legs", keywords: ["leg", "squat", "lunge", "quad", "hamstring", "calf"] },
  { name: "Core", keywords: ["abs", "core", "plank", "crunch", "oblique"] },
  { name: "Cardio", keywords: ["run", "bike", "swim", "walk", "cardio", "hiit"] }
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MuscleGroupHeatmap({ className = "" }: MuscleGroupHeatmapProps) {
  const heatmapData = useMemo(() => {
    const workouts = storage.getWorkouts();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
    
    const weekData: { [day: string]: { [muscleGroup: string]: number } } = {};
    
    // Initialize week data
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayKey = day.toISOString().split('T')[0];
      weekData[dayKey] = {};
      MUSCLE_GROUPS.forEach(group => {
        weekData[dayKey][group.name] = 0;
      });
    }
    
    // Process workouts from the current week
    workouts.forEach(workout => {
      const workoutDate = workout.date;
      if (weekData[workoutDate]) {
        workout.exercises.forEach(exercise => {
          const exerciseName = exercise.name.toLowerCase();
          
          MUSCLE_GROUPS.forEach(group => {
            const isTargeted = group.keywords.some(keyword => 
              exerciseName.includes(keyword.toLowerCase())
            );
            
            if (isTargeted) {
              // Calculate intensity based on sets/reps or duration
              let intensity = 0;
              if (exercise.type === 'strength') {
                intensity = exercise.sets.filter(set => set.completed).length;
              } else if (exercise.type === 'cardio') {
                // For cardio, count completed sets
                intensity = exercise.sets.filter(set => set.completed).length || 1;
              }
              weekData[workoutDate][group.name] += intensity;
            }
          });
        });
      }
    });
    
    return weekData;
  }, []);

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return "bg-dark-border";
    if (intensity <= 2) return "bg-accent-red/20";
    if (intensity <= 4) return "bg-accent-red/40";
    if (intensity <= 6) return "bg-accent-red/60";
    if (intensity <= 8) return "bg-accent-red/80";
    return "bg-accent-red";
  };

  const getIntensityLevel = (intensity: number) => {
    if (intensity === 0) return "None";
    if (intensity <= 2) return "Light";
    if (intensity <= 4) return "Moderate";
    if (intensity <= 6) return "High";
    return "Intense";
  };

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);

  return (
    <div className={`p-4 bg-dark-elevated rounded-lg border border-dark-border ${className}`}>
      <h3 className="text-lg font-['Montserrat'] font-semibold text-text-primary mb-4">
        Weekly Muscle Group Activity
      </h3>
      
      <div className="space-y-3">
        {/* Header with days */}
        <div className="grid grid-cols-8 gap-2 text-xs">
          <div></div>
          {DAYS.map((day, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <div key={day} className="text-center">
                <div className={`font-medium ${isToday ? 'text-accent-red' : 'text-text-secondary'}`}>
                  {day}
                </div>
                <div className="text-text-tertiary text-[10px]">
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Muscle group rows */}
        {MUSCLE_GROUPS.map(group => (
          <div key={group.name} className="grid grid-cols-8 gap-2 items-center">
            <div className="text-xs font-medium text-text-secondary text-right pr-2">
              {group.name}
            </div>
            {DAYS.map((_, dayIndex) => {
              const date = new Date(startOfWeek);
              date.setDate(startOfWeek.getDate() + dayIndex);
              const dayKey = date.toISOString().split('T')[0];
              const intensity = heatmapData[dayKey]?.[group.name] || 0;
              
              return (
                <div
                  key={dayIndex}
                  className={`h-6 rounded ${getIntensityColor(intensity)} border border-dark-border/50 transition-all duration-200 hover:scale-110 cursor-pointer`}
                  title={`${group.name} - ${DAYS[dayIndex]}: ${getIntensityLevel(intensity)} (${intensity})`}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-text-tertiary">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-dark-border"></div>
          <div className="w-3 h-3 rounded bg-accent-red/20"></div>
          <div className="w-3 h-3 rounded bg-accent-red/40"></div>
          <div className="w-3 h-3 rounded bg-accent-red/60"></div>
          <div className="w-3 h-3 rounded bg-accent-red/80"></div>
          <div className="w-3 h-3 rounded bg-accent-red"></div>
        </div>
        <span className="text-text-tertiary">More</span>
      </div>
    </div>
  );
}