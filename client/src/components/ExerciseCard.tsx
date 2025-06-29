import { useState, useEffect } from "react";
import { Exercise, ExerciseSet } from "@shared/schema";
import { ChevronDown, Trash2, Plus, Check, Circle } from "lucide-react";
import ExerciseCombobox from "./ExerciseCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (data: Partial<Exercise>) => void;
  onDelete: () => void;
  startOpen?: boolean;
}

export default function ExerciseCard({ exercise, onUpdate, onDelete, startOpen = false }: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(startOpen || !exercise.name);

  useEffect(() => {
    if (startOpen) {
      setIsOpen(true);
    }
  }, [startOpen]);

  const updateExerciseProperty = (key: keyof Exercise, value: any) => {
    onUpdate({ [key]: value });
  };

  const updateSet = (setIndex: number, updates: Partial<ExerciseSet>) => {
    const updatedSets = exercise.sets.map((set, index) =>
      index === setIndex ? { ...set, ...updates } : set
    );
    onUpdate({ sets: updatedSets });
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      completed: false,
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
      duration: lastSet?.duration || 0,
      distance: lastSet?.distance || 0,
    };
    onUpdate({ sets: [...exercise.sets, newSet] });
  };
  
  // When an exercise name is chosen for the first time, add a set.
  useEffect(() => {
    if (exercise.name && exercise.sets.length === 0) {
      addSet();
    }
  }, [exercise.name]);


  const removeSet = (setIndex: number) => {
    const updatedSets = exercise.sets.filter((_, index) => index !== setIndex);
    onUpdate({ sets: updatedSets });
  };

  const toggleSetCompleted = (setIndex: number) => {
    const set = exercise.sets[setIndex];
    updateSet(setIndex, { completed: !set.completed });
  };

  const getSetSummary = () => {
    if (exercise.sets.length === 0) return "0 sets";
    const completedSets = exercise.sets.filter(set => set.completed).length;
    return `${completedSets} / ${exercise.sets.length} sets`;
  };
  
  const isCardComplete = exercise.sets.length > 0 && exercise.sets.every(set => set.completed);

  return (
    <div className={cn(
        "bg-dark-elevated rounded-xl border transition-all duration-300",
        isOpen ? "border-accent-red/50" : "border-dark-border",
        isCardComplete ? "border-accent-green/30 bg-accent-green/5" : ""
    )}>
      {/* Card Header / Trigger */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h4 className="font-semibold text-lg text-text-primary">
            {exercise.name || "New Exercise"}
          </h4>
          <span className={cn(
              "text-sm px-2 py-0.5 rounded-full mt-1 inline-block",
              isCardComplete ? "bg-accent-green/20 text-accent-green" : "text-text-secondary bg-dark-primary"
          )}>
              {getSetSummary()}
          </span>
        </div>
        <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
              }}
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-accent-red p-1"
            >
              <Trash2 size={16} />
            </Button>
            <ChevronDown 
                className={cn("h-6 w-6 text-text-secondary transition-transform duration-300", isOpen && "rotate-180")} 
            />
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 border-t border-dark-border space-y-4">
          <ExerciseCombobox
            value={exercise.name}
            onSelect={(name) => updateExerciseProperty('name', name)}
          />

          <Select value={exercise.type || "strength"} onValueChange={(type) => updateExerciseProperty('type', type)}>
            <SelectTrigger className="w-40 bg-dark-primary text-text-primary border-dark-border text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-secondary border-dark-border" style={{ backgroundColor: 'hsl(0, 15%, 10%)', color: 'white' }}>
              <SelectItem value="strength" style={{ color: 'white' }}>Strength</SelectItem>
              <SelectItem value="cardio" style={{ color: 'white' }}>Cardio</SelectItem>
              <SelectItem value="core" style={{ color: 'white' }}>Core</SelectItem>
            </SelectContent>
          </Select>

          {/* Sets Header */}
          <div className="flex items-center space-x-2 text-sm text-center mb-2">
             <span className="text-text-secondary w-8 text-left">Set</span>
            {exercise.type === "cardio" ? (
              <>
                <span className="text-text-secondary flex-1">Duration (min)</span>
                <span className="text-text-secondary flex-1">Distance (km)</span>
              </>
            ) : (
              <>
                <span className="text-text-secondary flex-1">Weight (kg)</span>
                <span className="text-text-secondary flex-1">Reps</span>
              </>
            )}
            <span className="text-text-secondary w-12">Done</span>
            <span className="w-8"></span> {/* Spacer for delete button */}
          </div>
          
          {/* Sets */}
          <div className="space-y-2">
            {exercise.sets.map((set, index) => (
              <div key={set.id} className="flex items-center space-x-2">
                <span className="text-text-primary w-8 text-center text-sm">{index + 1}</span>
                {exercise.type === "cardio" ? (
                    <>
                        <Input type="number" value={set.duration || ''} onChange={(e) => updateSet(index, { duration: parseFloat(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border border-dark-border" placeholder="min"/>
                        <Input type="number" value={set.distance || ''} onChange={(e) => updateSet(index, { distance: parseFloat(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border border-dark-border" placeholder="km"/>
                    </>
                ) : (
                    <>
                        <Input type="number" value={set.weight || ''} onChange={(e) => updateSet(index, { weight: parseFloat(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border border-dark-border" placeholder="kg"/>
                        <Input type="number" value={set.reps || ''} onChange={(e) => updateSet(index, { reps: parseInt(e.target.value) || 0 })} className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border border-dark-border" placeholder="reps"/>
                    </>
                )}
                <Button onClick={() => toggleSetCompleted(index)} variant="ghost" size="sm" className={`w-12 h-8 flex items-center justify-center rounded-md ${set.completed ? 'text-accent-green bg-accent-green/10' : 'text-text-secondary'}`}>
                  {set.completed ? <Check size={16} /> : <Circle size={16} />}
                </Button>
                <Button onClick={() => removeSet(index)} variant="ghost" size="icon" className="text-text-secondary hover:text-accent-red w-8 h-8">
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
          
          <Button onClick={addSet} variant="ghost" className="text-accent-green hover:text-green-400 text-sm font-medium p-0 h-auto">
            <Plus className="mr-1" size={16} /> Add Set
          </Button>
        </div>
      )}
    </div>
  );
}
