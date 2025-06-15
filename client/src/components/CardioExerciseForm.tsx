import { useState } from "react";
import { Exercise, ExerciseSet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Check, Circle, Plus, Timer, Clock } from "lucide-react";
import RestTimer from "./RestTimer";

interface CardioExerciseFormProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
  onDelete: () => void;
}

export default function CardioExerciseForm({ exercise, onUpdate, onDelete }: CardioExerciseFormProps) {
  const [showRestTimer, setShowRestTimer] = useState(false);

  const updateExerciseName = (name: string) => {
    onUpdate({ ...exercise, name });
  };

  const updateSet = (setIndex: number, updates: Partial<ExerciseSet>) => {
    const updatedSets = exercise.sets.map((set, index) => 
      index === setIndex ? { ...set, ...updates } : set
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const updateCardioType = (cardioType: "run" | "cycle" | "swim" | "hike" | "sauna" | "other") => {
    onUpdate({ ...exercise, cardioType });
  };

  const addSet = () => {
    const newSet: ExerciseSet = {
      id: Date.now().toString(),
      completed: false,
      duration: undefined,
      distance: undefined,
      steps: undefined,
      intervals: undefined
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSet = (setIndex: number) => {
    if (exercise.sets.length > 1) {
      const updatedSets = exercise.sets.filter((_, index) => index !== setIndex);
      onUpdate({ ...exercise, sets: updatedSets });
    }
  };

  const toggleCompleted = (setIndex: number) => {
    const set = exercise.sets[setIndex];
    updateSet(setIndex, { completed: !set.completed });
    
    if (!set.completed) {
      setShowRestTimer(true);
    }
  };

  return (
    <div className="bg-dark-elevated rounded-xl p-5 border border-dark-border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Input
          value={exercise.name}
          onChange={(e) => updateExerciseName(e.target.value)}
          className="bg-transparent text-text-primary font-medium text-lg border-none outline-none p-0 h-auto flex-1 mr-4"
          placeholder="Cardio exercise name"
        />
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-text-secondary hover:text-accent-red p-1"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Cardio Type Selection */}
      <div className="mb-3">
        <label className="text-text-secondary text-sm font-medium mb-2 block">
          Cardio Type
        </label>
        <Select value={exercise.cardioType || "other"} onValueChange={(value) => updateCardioType(value as "run" | "cycle" | "swim" | "hike" | "sauna" | "other")}>
          <SelectTrigger className="w-full bg-dark-primary text-text-primary border-dark-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-dark-secondary border-dark-border" style={{ backgroundColor: 'hsl(0, 15%, 10%)', color: 'white' }}>
            <SelectItem value="run" style={{ color: 'white' }}>Running</SelectItem>
            <SelectItem value="cycle" style={{ color: 'white' }}>Cycling</SelectItem>
            <SelectItem value="swim" style={{ color: 'white' }}>Swimming</SelectItem>
            <SelectItem value="hike" style={{ color: 'white' }}>Hiking</SelectItem>
            <SelectItem value="sauna" style={{ color: 'white' }}>Sauna</SelectItem>
            <SelectItem value="other" style={{ color: 'white' }}>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sets */}
      <div className="space-y-3 mb-4">
        {exercise.sets.map((set, setIndex) => (
          <div key={set.id} className="bg-dark-primary rounded-lg p-4 border border-dark-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-secondary font-medium text-sm">Set {setIndex + 1}</span>
              {exercise.sets.length > 1 && (
                <Button
                  onClick={() => removeSet(setIndex)}
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary hover:text-accent-red p-1"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-text-secondary text-xs font-medium mb-1 block">
                  Duration
                </label>
                <div className="flex items-center space-x-1">
                  <Input
                    type="number"
                    value={set.duration || ""}
                    onChange={(e) => updateSet(setIndex, { duration: parseInt(e.target.value) || undefined })}
                    className="bg-dark-elevated border-dark-border text-text-primary font-medium text-sm h-8"
                    placeholder="0"
                  />
                  <span className="text-accent-red font-medium text-xs">min</span>
                </div>
              </div>
              
              <div>
                <label className="text-text-secondary text-xs font-medium mb-1 block">
                  Distance
                </label>
                <div className="flex items-center space-x-1">
                  <Input
                    type="number"
                    value={set.distance || ""}
                    onChange={(e) => updateSet(setIndex, { distance: parseFloat(e.target.value) || undefined })}
                    className="bg-dark-elevated border-dark-border text-text-primary font-medium text-sm h-8"
                    placeholder="0"
                    step="0.1"
                  />
                  <span className="text-accent-red font-medium text-xs">km</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-text-secondary text-xs font-medium mb-1 block">
                  Steps
                </label>
                <Input
                  type="number"
                  value={set.steps || ""}
                  onChange={(e) => updateSet(setIndex, { steps: parseInt(e.target.value) || undefined })}
                  className="bg-dark-elevated border-dark-border text-text-primary font-medium text-sm h-8"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="text-text-secondary text-xs font-medium mb-1 block">
                  Intervals
                </label>
                <Input
                  type="number"
                  value={set.intervals || ""}
                  onChange={(e) => updateSet(setIndex, { intervals: parseInt(e.target.value) || undefined })}
                  className="bg-dark-elevated border-dark-border text-text-primary font-medium text-sm h-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => toggleCompleted(setIndex)}
                className={`flex-1 font-medium text-sm h-8 ${
                  set.completed 
                    ? "bg-accent-green text-white" 
                    : "bg-accent-navy text-white hover:bg-accent-light-navy"
                }`}
              >
                {set.completed ? <Check size={14} className="mr-1" /> : <Circle size={14} className="mr-1" />}
                {set.completed ? "Done" : "Complete"}
              </Button>
              
              {set.completed && (
                <Button
                  onClick={() => setShowRestTimer(true)}
                  variant="outline"
                  size="sm"
                  className="border-dark-border text-text-secondary hover:text-text-primary h-8 px-3"
                >
                  <Timer size={14} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Set Button */}
      <Button
        onClick={addSet}
        variant="outline"
        className="w-full mb-3 border-dark-border text-text-secondary hover:text-text-primary h-9"
      >
        <Plus size={16} className="mr-2" />
        Add Set
      </Button>

      {/* Rest Timer */}
      <RestTimer
        isOpen={showRestTimer}
        onClose={() => setShowRestTimer(false)}
      />
    </div>
  );
}