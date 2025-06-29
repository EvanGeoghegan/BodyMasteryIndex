import { Exercise, ExerciseSet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, Circle, Trash2 } from "lucide-react";
import ExerciseCombobox from "./ExerciseCombobox"; // Import our searchable dropdown

interface ExerciseFormProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
}

export default function ExerciseForm({ exercise, onUpdate }: ExerciseFormProps) {
  const updateExerciseName = (name: string) => {
    onUpdate({ ...exercise, name });
  };

  const updateExerciseType = (type: "strength" | "cardio" | "core") => {
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
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
    };
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

  // When a new exercise is added, add one default set automatically
  if (exercise.name && exercise.sets.length === 0) {
    addSet();
  }

  return (
    <div className="space-y-4">
      <div className="flex-1">
        <ExerciseCombobox
          value={exercise.name}
          onSelect={updateExerciseName}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Select value={exercise.type || "strength"} onValueChange={updateExerciseType}>
          <SelectTrigger className="w-32 bg-dark-primary text-text-primary border-dark-border text-sm h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-dark-secondary border-dark-border" style={{ backgroundColor: 'hsl(0, 15%, 10%)', color: 'white' }}>
            <SelectItem value="strength" style={{ color: 'white' }}>Strength</SelectItem>
            <SelectItem value="cardio" style={{ color: 'white' }}>Cardio</SelectItem>
            <SelectItem value="core" style={{ color: 'white' }}>Core</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Sets Header */}
      <div className="flex items-center space-x-2 text-sm text-center mb-2">
        <span className="text-text-secondary w-8 text-left">Set</span>
        <span className="text-text-secondary flex-1">Weight (kg)</span>
        <span className="text-text-secondary flex-1">Reps</span>
        <span className="text-text-secondary w-12">Done</span>
        <span className="w-8"></span> {/* Spacer for delete button */}
      </div>
      
      {/* Sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, index) => (
          <div key={set.id} className="flex items-center space-x-2">
            <span className="text-text-primary w-8 text-center text-sm">{index + 1}</span>
            <Input
              type="number"
              value={set.weight || ''}
              onChange={(e) => updateSet(index, { weight: parseFloat(e.target.value) || 0 })}
              className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border border-dark-border"
              placeholder="kg"
            />
            <Input
              type="number"
              value={set.reps || ''}
              onChange={(e) => updateSet(index, { reps: parseInt(e.target.value) || 0 })}
              className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border border-dark-border"
              placeholder="reps"
            />
            <Button
              onClick={() => toggleSetCompleted(index)}
              variant="ghost"
              size="sm"
              className={`w-12 h-8 flex items-center justify-center rounded-md ${
                set.completed 
                  ? 'text-accent-green bg-accent-green/10' 
                  : 'text-text-secondary'
              }`}
            >
              {set.completed ? <Check size={16} /> : <Circle size={16} />}
            </Button>
            <Button
              onClick={() => removeSet(index)}
              variant="ghost"
              size="icon"
              className="text-text-secondary hover:text-accent-red w-8 h-8"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
      
      <Button
        onClick={addSet}
        variant="ghost"
        className="text-accent-green hover:text-green-400 text-sm font-medium p-0 h-auto"
      >
        <Plus className="mr-1" size={16} />
        Add Set
      </Button>
    </div>
  );
}
