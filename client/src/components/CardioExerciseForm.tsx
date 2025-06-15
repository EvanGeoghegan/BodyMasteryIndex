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
      distance: undefined
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

      {/* Sets Header */}
      <div className="flex items-center space-x-2 text-sm mb-2">
        <span className="text-text-secondary w-8">Set</span>
        <span className="text-text-secondary w-20">Duration</span>
        <span className="text-text-secondary w-20">Distance</span>
        <span className="text-text-secondary w-8"></span>
      </div>

      {/* Sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <div key={set.id} className="flex items-center space-x-2">
            <span className="text-text-primary w-8 text-sm">{setIndex + 1}</span>
            <Input
              type="number"
              value={set.duration || ''}
              onChange={(e) => updateSet(setIndex, { duration: parseInt(e.target.value) || undefined })}
              className="w-20 bg-dark-primary text-text-primary border-dark-border text-sm h-8"
              placeholder="min"
            />
            <Input
              type="number"
              value={set.distance || ''}
              onChange={(e) => updateSet(setIndex, { distance: parseFloat(e.target.value) || undefined })}
              className="w-20 bg-dark-primary text-text-primary border-dark-border text-sm h-8"
              placeholder="km"
              step="0.1"
            />
            
            <Button
              onClick={() => toggleCompleted(setIndex)}
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8"
            >
              {set.completed ? (
                <Check className="text-accent-green" size={16} />
              ) : (
                <Circle className="text-text-secondary" size={16} />
              )}
            </Button>

            {exercise.sets.length > 1 && (
              <Button
                onClick={() => removeSet(setIndex)}
                variant="ghost"
                size="sm"
                className="text-text-secondary hover:text-accent-red p-1 h-8 w-8"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add Set Button */}
      <Button
        onClick={addSet}
        variant="ghost"
        className="mt-3 text-accent-green hover:text-green-400 text-sm font-medium p-0 h-auto"
      >
        <Plus className="mr-1" size={16} />
        Add Set
      </Button>
    </div>
  );
}