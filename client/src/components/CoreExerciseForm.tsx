import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Check, Circle, Timer } from "lucide-react";
import { Exercise, ExerciseSet } from "@shared/schema";
import { nanoid } from "nanoid";
import RestTimer from "./RestTimer";

interface CoreExerciseFormProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
  onDelete: () => void;
}

export default function CoreExerciseForm({ exercise, onUpdate, onDelete }: CoreExerciseFormProps) {
  const [showRestTimer, setShowRestTimer] = useState(false);

  const addSet = () => {
    const newSet: ExerciseSet = {
      id: nanoid(),
      reps: 0,
      weight: 0,
      duration: 0,
      distance: 0,
      completed: false,
      restTime: 0,
    };

    onUpdate({
      ...exercise,
      sets: [...exercise.sets, newSet],
    });
  };

  const updateSet = (setId: string, updates: Partial<ExerciseSet>) => {
    onUpdate({
      ...exercise,
      sets: exercise.sets.map(set =>
        set.id === setId ? { ...set, ...updates } : set
      ),
    });
  };

  const deleteSet = (setId: string) => {
    onUpdate({
      ...exercise,
      sets: exercise.sets.filter(set => set.id !== setId),
    });
  };

  const updateExerciseName = (name: string) => {
    onUpdate({ ...exercise, name });
  };

  const updateNotes = (notes: string) => {
    onUpdate({ ...exercise, notes });
  };

  const toggleCompleted = (setIndex: number) => {
    const set = exercise.sets[setIndex];
    if (!set.completed) {
      const updatedSets = exercise.sets.map((s, index) =>
        index <= setIndex ? { ...s, completed: true } : s
      );
      onUpdate({ ...exercise, sets: updatedSets });
    } else {
      updateSet(set.id, { completed: false });
    }
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

      {/* Exercise Type Badge */}
      <div className="flex items-center space-x-2 mb-3">
        <Badge variant="secondary" className="bg-accent-red/20 text-accent-red border-accent-red/30">
          Core
        </Badge>
      </div>
      


      {/* Sets Header */}
      <div className="flex items-center space-x-2 text-sm mb-2">
        <span className="w-8 text-text-secondary">Set</span>
        <span className="flex-1 text-text-secondary text-center">Duration</span>
        <span className="text-text-secondary text-xs">or</span>
        <span className="flex-1 text-text-secondary text-center">Reps</span>
        <span className="w-16 text-text-secondary text-center"></span>
      </div>

      {/* Sets */}
      <div className="space-y-2 mb-4">
        {exercise.sets.map((set, index) => (
          <div key={set.id} className="flex items-center space-x-2 p-2 bg-dark-primary rounded-lg border border-dark-border">
            <span className="text-sm font-medium text-text-secondary w-8">{index + 1}</span>
            
            {/* Duration */}
            <div className="flex-1">
              <input
                type="number"
                value={set.duration || ""}
                onChange={(e) => updateSet(set.id, { duration: Number(e.target.value) || 0 })}
                placeholder=""
                className="w-full bg-transparent text-text-primary text-center text-sm border-none outline-none"
              />
              <div className="text-xs text-text-secondary text-center">sec</div>
            </div>

            <div className="text-xs text-text-secondary">or</div>

            {/* Reps */}
            <div className="flex-1">
              <input
                type="number"
                value={set.reps || ""}
                onChange={(e) => updateSet(set.id, { reps: Number(e.target.value) || 0 })}
                placeholder=""
                className="w-full bg-transparent text-text-primary text-center text-sm border-none outline-none"
              />
              <div className="text-xs text-text-secondary text-center">reps</div>
            </div>

            {/* Complete button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCompleted(index)}
              className="p-1 h-8 w-8"
            >
              {set.completed ? (
                <Check className="text-accent-green" size={16} />
              ) : (
                <Circle className="text-text-secondary" size={16} />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteSet(set.id)}
              className="p-1 h-8 w-8 text-text-secondary hover:text-accent-red"
            >
              <Trash2 size={14} />
            </Button>
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