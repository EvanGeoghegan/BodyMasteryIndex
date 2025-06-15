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
      


      {/* Sets */}
      <div className="space-y-3 mb-4">
        {exercise.sets.map((set, index) => (
          <div key={set.id} className="bg-dark-primary rounded-lg p-4 border border-dark-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-secondary font-medium text-sm">Set {index + 1}</span>
              {exercise.sets.length > 1 && (
                <Button
                  onClick={() => deleteSet(set.id)}
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
                    onChange={(e) => updateSet(set.id, { duration: Number(e.target.value) || 0 })}
                    className="bg-dark-elevated border-dark-border text-text-primary font-medium text-sm h-8"
                    placeholder="0"
                  />
                  <span className="text-accent-red font-medium text-xs">sec</span>
                </div>
              </div>
              
              <div>
                <label className="text-text-secondary text-xs font-medium mb-1 block">
                  Reps
                </label>
                <Input
                  type="number"
                  value={set.reps || ""}
                  onChange={(e) => updateSet(set.id, { reps: Number(e.target.value) || 0 })}
                  className="bg-dark-elevated border-dark-border text-text-primary font-medium text-sm h-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  updateSet(set.id, { completed: !set.completed });
                  if (!set.completed) {
                    setShowRestTimer(true);
                  }
                }}
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