import { Exercise, ExerciseSet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Circle, Trash2 } from "lucide-react";
import ExerciseCombobox from "./ExerciseCombobox";
import masterExerciseList from "@/lib/exercises.json";

interface ExerciseFormProps {
  exercise: Exercise;
  onUpdate: (data: Partial<Exercise>) => void;
  workoutType: "strength" | "cardio" | "core" | "sports"; // Accept the workoutType
}

export default function ExerciseForm({ exercise, onUpdate, workoutType }: ExerciseFormProps) {
  
  const handleExerciseSelect = (exerciseName: string) => {
    const selected = masterExerciseList.find(ex => ex.name === exerciseName);
    const category = selected ? selected.category : workoutType;
    onUpdate({ name: exerciseName, type: category as any });

    // Add a default set if none exist
    if (exercise.sets.length === 0) {
      addSet(category);
    }
  };

  const updateSet = (setIndex: number, updates: Partial<ExerciseSet>) => {
    const updatedSets = exercise.sets.map((set, index) =>
      index === setIndex ? { ...set, ...updates } : set
    );
    onUpdate({ sets: updatedSets });
  };

  const addSet = (category?: string) => {
    const currentCategory = category || exercise.type;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      completed: false,
    };

    if (currentCategory === 'strength') {
      newSet.weight = lastSet?.weight || 0;
      newSet.reps = lastSet?.reps || 0;
    } else if (currentCategory === 'core') {
      newSet.reps = lastSet?.reps || 0;
      newSet.duration = lastSet?.duration || 0;
    } else { // cardio and sports
      newSet.duration = lastSet?.duration || 0;
      newSet.distance = lastSet?.distance || 0;
    }
    
    onUpdate({ sets: [...exercise.sets, newSet] });
  };

  const removeSet = (setIndex: number) => {
    const updatedSets = exercise.sets.filter((_, index) => index !== setIndex);
    onUpdate({ sets: updatedSets });
  };

  const toggleSetCompleted = (setIndex: number) => {
    const set = exercise.sets[setIndex];
    updateSet(setIndex, { completed: !set.completed });
  };

  const displayCategory = exercise.type as string; // Cast to string to allow for 'sports'

  return (
    <div className="space-y-4">
      <ExerciseCombobox
        value={exercise.name}
        onSelect={handleExerciseSelect}
        filter={workoutType} // Pass the filter prop here
      />

      {exercise.name && (
        <>
          {/* Sets Header */}
          <div className="flex items-center space-x-2 text-sm text-center mb-2">
            <span className="text-text-secondary w-8 text-left">Set</span>
            {displayCategory === 'strength' && <><span className="text-text-secondary flex-1">Weight</span><span className="text-text-secondary flex-1">Reps</span></>}
            {displayCategory === 'core' && <><span className="text-text-secondary flex-1">Reps</span><span className="text-text-secondary flex-1">Duration (s)</span></>}
            {(displayCategory === 'cardio' || displayCategory === 'sports') && <><span className="text-text-secondary flex-1">Duration (min)</span><span className="text-text-secondary flex-1">Distance (km)</span></>}
            <span className="text-text-secondary w-12">Done</span>
            <span className="w-8"></span>
          </div>
          
          {/* Sets */}
          <div className="space-y-2">
            {exercise.sets.map((set, index) => (
              <div key={set.id} className="flex items-center space-x-2">
                <span className="text-text-primary w-8 text-center text-sm">{index + 1}</span>
                {displayCategory === 'strength' && <>
                  <Input type="number" value={set.weight || ''} onChange={(e) => updateSet(index, { weight: parseFloat(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border" placeholder="kg"/>
                  <Input type="number" value={set.reps || ''} onChange={(e) => updateSet(index, { reps: parseInt(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border" placeholder="reps"/>
                </>}
                {displayCategory === 'core' && <>
                  <Input type="number" value={set.reps || ''} onChange={(e) => updateSet(index, { reps: parseInt(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border" placeholder="reps"/>
                  <Input type="number" value={set.duration || ''} onChange={(e) => updateSet(index, { duration: parseInt(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border" placeholder="sec"/>
                </>}
                {(displayCategory === 'cardio' || displayCategory === 'sports') && <>
                  <Input type="number" value={set.duration || ''} onChange={(e) => updateSet(index, { duration: parseInt(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border" placeholder="min"/>
                  <Input type="number" step="0.1" value={set.distance || ''} onChange={(e) => updateSet(index, { distance: parseFloat(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border" placeholder="km"/>
                </>}
                <Button onClick={() => toggleSetCompleted(index)} variant="ghost" size="sm" className={`w-12 h-8 flex items-center justify-center rounded-md ${set.completed ? 'text-accent-green bg-accent-green/10' : 'text-text-secondary'}`}>
                  {set.completed ? <Check size={16} /> : <Circle size={16} />}
                </Button>
                <Button onClick={() => removeSet(index)} variant="ghost" size="icon" className="text-text-secondary hover:text-accent-red w-8 h-8">
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
          
          <Button onClick={() => addSet()} variant="ghost" className="text-accent-green hover:text-green-400 text-sm font-medium p-0 h-auto">
            <Plus className="mr-1" size={16} /> Add Set
          </Button>
        </>
      )}
    </div>
  );
}
