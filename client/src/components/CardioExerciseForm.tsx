import { useState } from "react";
import { Exercise, ExerciseSet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Play, Pause, RotateCcw, CheckCircle } from "lucide-react";

interface CardioExerciseFormProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
  onDelete: () => void;
}

export default function CardioExerciseForm({ exercise, onUpdate, onDelete }: CardioExerciseFormProps) {
  const [isActive, setIsActive] = useState(false);
  
  const updateExerciseName = (name: string) => {
    onUpdate({ ...exercise, name });
  };

  const updateCardioType = (cardioType: "zone2" | "low_intensity" | "high_intensity" | "intervals" | "sprints" | "steps") => {
    onUpdate({ ...exercise, cardioType });
  };

  const updateSet = (setIndex: number, updates: Partial<ExerciseSet>) => {
    const updatedSets = exercise.sets.map((set, index) => 
      index === setIndex ? { ...set, ...updates } : set
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const toggleCompleted = () => {
    const set = exercise.sets[0];
    updateSet(0, { completed: !set.completed });
    setIsActive(false);
  };

  const cardioTypeLabels = {
    zone2: "Zone 2",
    low_intensity: "Low Intensity",
    high_intensity: "High Intensity", 
    intervals: "Intervals",
    sprints: "Sprints",
    steps: "Steps"
  };

  const getCardioTypeColor = (type?: string) => {
    switch (type) {
      case "zone2": return "from-blue-500/20 to-blue-600/10";
      case "low_intensity": return "from-green-500/20 to-green-600/10";
      case "high_intensity": return "from-red-500/20 to-red-600/10";
      case "intervals": return "from-purple-500/20 to-purple-600/10";
      case "sprints": return "from-orange-500/20 to-orange-600/10";
      case "steps": return "from-yellow-500/20 to-yellow-600/10";
      default: return "from-accent-navy/20 to-accent-light-navy/10";
    }
  };

  const set = exercise.sets[0] || { id: "1", completed: false };

  return (
    <div className={`bg-gradient-to-br ${getCardioTypeColor(exercise.cardioType)} rounded-xl p-6 border-2 ${set.completed ? 'border-accent-green/50' : 'border-accent-navy/30'} relative overflow-hidden`}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-full transform translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/3 to-transparent rounded-full transform -translate-x-8 translate-y-8"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Input
            value={exercise.name}
            onChange={(e) => updateExerciseName(e.target.value)}
            className="bg-dark-secondary/80 backdrop-blur-sm text-text-primary font-bold text-xl border-accent-navy/50 flex-1 mr-4"
            placeholder="Cardio Exercise"
          />
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-accent-red p-2 rounded-full"
          >
            <Trash2 size={18} />
          </Button>
        </div>

        {/* Cardio Type Selection */}
        <div className="mb-6">
          <Select value={exercise.cardioType || ""} onValueChange={updateCardioType}>
            <SelectTrigger className="bg-dark-secondary/80 backdrop-blur-sm text-text-primary border-accent-navy/50 text-lg">
              <SelectValue placeholder="Select cardio type" />
            </SelectTrigger>
            <SelectContent className="bg-dark-secondary border-accent-navy/50">
              {Object.entries(cardioTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-lg">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Duration */}
          <div className="bg-dark-secondary/60 backdrop-blur-sm rounded-lg p-4 border border-accent-navy/30">
            <label className="text-accent-light-navy text-sm font-semibold mb-2 block uppercase tracking-wide">
              Duration
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={set.duration || 0}
                onChange={(e) => updateSet(0, { duration: parseInt(e.target.value) || 0 })}
                className="bg-dark-primary border-accent-navy text-text-primary text-2xl font-bold text-center"
                placeholder="0"
              />
              <span className="text-accent-light-navy font-bold text-lg">min</span>
            </div>
          </div>

          {/* Distance */}
          <div className="bg-dark-secondary/60 backdrop-blur-sm rounded-lg p-4 border border-accent-navy/30">
            <label className="text-accent-light-navy text-sm font-semibold mb-2 block uppercase tracking-wide">
              Distance
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={set.distance || 0}
                onChange={(e) => updateSet(0, { distance: parseFloat(e.target.value) || 0 })}
                className="bg-dark-primary border-accent-navy text-text-primary text-2xl font-bold text-center"
                placeholder="0"
                step="0.1"
              />
              <span className="text-accent-light-navy font-bold text-lg">km</span>
            </div>
          </div>
        </div>

        {/* Rest Time */}
        <div className="mb-6">
          <div className="bg-dark-secondary/60 backdrop-blur-sm rounded-lg p-4 border border-accent-navy/30">
            <label className="text-accent-light-navy text-sm font-semibold mb-2 block uppercase tracking-wide">
              Rest Time
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={set.restTime || 0}
                onChange={(e) => updateSet(0, { restTime: parseInt(e.target.value) || 0 })}
                className="bg-dark-primary border-accent-navy text-text-primary text-xl font-bold text-center w-24"
                placeholder="0"
              />
              <span className="text-accent-light-navy font-bold">seconds</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIsActive(!isActive)}
              className={`px-6 py-3 font-bold text-lg rounded-xl ${
                isActive 
                  ? "bg-accent-red text-white" 
                  : "bg-accent-navy text-white hover:bg-accent-light-navy"
              }`}
            >
              {isActive ? <Pause size={20} className="mr-2" /> : <Play size={20} className="mr-2" />}
              {isActive ? "Pause" : "Start"}
            </Button>
            
            <Button
              variant="outline"
              className="border-accent-navy/50 text-accent-navy hover:bg-accent-navy/10 px-4 py-3 rounded-xl"
            >
              <RotateCcw size={18} />
            </Button>
          </div>

          <Button
            onClick={toggleCompleted}
            className={`px-8 py-3 font-bold text-lg rounded-xl ${
              set.completed 
                ? "bg-accent-green text-white" 
                : "bg-gradient-to-r from-accent-navy to-accent-light-navy text-white hover:from-accent-light-navy hover:to-accent-navy"
            }`}
          >
            {set.completed ? (
              <>
                <CheckCircle size={20} className="mr-2" />
                Completed
              </>
            ) : (
              "Mark Complete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}