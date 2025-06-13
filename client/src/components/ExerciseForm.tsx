import { useState } from "react";
import { Exercise, ExerciseSet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Check, Circle } from "lucide-react";

interface ExerciseFormProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
  onDelete: () => void;
}

export default function ExerciseForm({ exercise, onUpdate, onDelete }: ExerciseFormProps) {
  const updateExerciseName = (name: string) => {
    onUpdate({ ...exercise, name });
  };

  const updateExerciseType = (type: "strength" | "cardio") => {
    onUpdate({ ...exercise, type });
  };

  const updateSet = (setIndex: number, updates: Partial<ExerciseSet>) => {
    const updatedSets = exercise.sets.map((set, index) => 
      index === setIndex ? { ...set, ...updates } : set
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      completed: false,
    };

    if (exercise.type === "cardio") {
      newSet.duration = lastSet?.duration || 0;
      newSet.distance = lastSet?.distance || 0;
    } else {
      newSet.weight = lastSet?.weight || 0;
      newSet.reps = lastSet?.reps || 0;
    }

    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSet = (setIndex: number) => {
    const updatedSets = exercise.sets.filter((_, index) => index !== setIndex);
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const toggleSetCompleted = (setIndex: number) => {
    const set = exercise.sets[setIndex];
    updateSet(setIndex, { completed: !set.completed });
  };

  const formatRestTime = (seconds?: number): string => {
    if (!seconds) return "0s";
    return `${seconds}s`;
  };



  return (
    <div className="bg-dark-elevated rounded-xl p-5 border border-dark-border shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <Input
          value={exercise.name}
          onChange={(e) => updateExerciseName(e.target.value)}
          className="bg-transparent text-text-primary font-medium text-lg border-none outline-none p-0 h-auto flex-1 mr-4"
          placeholder="Exercise name"
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

      {/* Exercise Type and Cardio Type */}
      <div className="flex items-center space-x-2 mb-3">
        <Select value={exercise.type || "strength"} onValueChange={updateExerciseType}>
          <SelectTrigger className="w-32 bg-dark-primary text-text-primary border-dark-border text-sm h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-dark-secondary border-dark-border" style={{ backgroundColor: 'hsl(0, 15%, 10%)', color: 'white' }}>
            <SelectItem value="strength" style={{ color: 'white' }}>Strength</SelectItem>
            <SelectItem value="cardio" style={{ color: 'white' }}>Cardio</SelectItem>
          </SelectContent>
        </Select>


      </div>
      
      {/* Sets Header */}
      <div className="flex items-center space-x-2 text-sm mb-2">
        <span className="text-text-secondary w-8">Set</span>
        {exercise.type === "cardio" ? (
          <>
            <span className="text-text-secondary w-20">Duration</span>
            <span className="text-text-secondary w-20">Distance</span>
          </>
        ) : (
          <>
            <span className="text-text-secondary w-20">Weight</span>
            <span className="text-text-secondary w-16">Reps</span>
          </>
        )}
        <span className="text-text-secondary w-16">Rest (s)</span>
        <span className="text-text-secondary w-8"></span>
      </div>
      
      {/* Sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, index) => (
          <div key={set.id} className="flex items-center space-x-2">
            <span className="text-text-primary w-8 text-sm">{index + 1}</span>
            
            {exercise.type === "cardio" ? (
              <>
                <Input
                  type="number"
                  value={set.duration || ''}
                  onChange={(e) => updateSet(index, { duration: parseFloat(e.target.value) || 0 })}
                  className="w-20 bg-dark-primary text-text-primary border-dark-border text-sm h-8"
                  placeholder="min"
                />
                <Input
                  type="number"
                  value={set.distance || ''}
                  onChange={(e) => updateSet(index, { distance: parseFloat(e.target.value) || 0 })}
                  className="w-20 bg-dark-primary text-text-primary border-dark-border text-sm h-8"
                  placeholder="km"
                />
              </>
            ) : (
              <>
                <Input
                  type="number"
                  value={set.weight || ''}
                  onChange={(e) => updateSet(index, { weight: parseFloat(e.target.value) || 0 })}
                  className="w-20 bg-dark-primary text-text-primary border-dark-border text-sm h-8"
                  placeholder="kg"
                />
                <Input
                  type="number"
                  value={set.reps || ''}
                  onChange={(e) => updateSet(index, { reps: parseInt(e.target.value) || 0 })}
                  className="w-16 bg-dark-primary text-text-primary border-dark-border text-sm h-8"
                  placeholder="reps"
                />
              </>
            )}
            
            <Input
              type="number"
              value={set.restTime || ''}
              onChange={(e) => updateSet(index, { restTime: parseInt(e.target.value) || 0 })}
              className="w-16 bg-dark-primary text-text-primary border-dark-border text-sm h-8"
              placeholder="sec"
            />
            
            <Button
              onClick={() => toggleSetCompleted(index)}
              variant="ghost"
              size="sm"
              className={`w-8 p-1 ${
                set.completed 
                  ? 'text-accent-green hover:text-green-400' 
                  : 'text-text-secondary hover:text-accent-green'
              }`}
            >
              {set.completed ? <Check size={16} /> : <Circle size={16} />}
            </Button>
            {exercise.sets.length > 1 && (
              <Button
                onClick={() => removeSet(index)}
                variant="ghost"
                size="sm"
                className="text-text-secondary hover:text-accent-red p-1"
              >
                <Trash2 size={12} />
              </Button>
            )}
          </div>
        ))}
      </div>
      
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
