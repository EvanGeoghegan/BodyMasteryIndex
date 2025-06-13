import { Exercise, ExerciseSet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Check, Circle } from "lucide-react";

interface CardioExerciseFormProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
  onDelete: () => void;
}

export default function CardioExerciseForm({ exercise, onUpdate, onDelete }: CardioExerciseFormProps) {
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

  const toggleCompleted = () => {
    const set = exercise.sets[0];
    updateSet(0, { completed: !set.completed });
  };

  const set = exercise.sets[0] || { id: "1", completed: false };

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
          <SelectContent className="bg-dark-secondary border-dark-border" style={{ backgroundColor: 'hsl(220, 20%, 12%)', color: 'white' }}>
            <SelectItem value="run" style={{ color: 'white' }}>Running</SelectItem>
            <SelectItem value="cycle" style={{ color: 'white' }}>Cycling</SelectItem>
            <SelectItem value="swim" style={{ color: 'white' }}>Swimming</SelectItem>
            <SelectItem value="hike" style={{ color: 'white' }}>Hiking</SelectItem>
            <SelectItem value="sauna" style={{ color: 'white' }}>Sauna</SelectItem>
            <SelectItem value="other" style={{ color: 'white' }}>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cardio Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-text-secondary text-sm font-medium mb-1 block">
            Duration
          </label>
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              value={set.duration || ""}
              onChange={(e) => updateSet(0, { duration: parseInt(e.target.value) || undefined })}
              className="bg-dark-primary border-dark-border text-text-primary font-medium"
              placeholder="0"
            />
            <span className="text-accent-navy font-medium text-sm">min</span>
          </div>
        </div>
        
        <div>
          <label className="text-text-secondary text-sm font-medium mb-1 block">
            Distance
          </label>
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              value={set.distance || ""}
              onChange={(e) => updateSet(0, { distance: parseFloat(e.target.value) || undefined })}
              className="bg-dark-primary border-dark-border text-text-primary font-medium"
              placeholder="0"
              step="0.1"
            />
            <span className="text-accent-navy font-medium text-sm">km</span>
          </div>
        </div>
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-text-secondary text-sm font-medium mb-1 block">
            Steps (optional)
          </label>
          <Input
            type="number"
            value={set.steps || ""}
            onChange={(e) => updateSet(0, { steps: parseInt(e.target.value) || undefined })}
            className="bg-dark-primary border-dark-border text-text-primary font-medium"
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="text-text-secondary text-sm font-medium mb-1 block">
            Intervals (optional)
          </label>
          <Input
            type="number"
            value={set.intervals || ""}
            onChange={(e) => updateSet(0, { intervals: parseInt(e.target.value) || undefined })}
            className="bg-dark-primary border-dark-border text-text-primary font-medium"
            placeholder="0"
          />
        </div>
      </div>

      {/* Completion Button */}
      <Button
        onClick={toggleCompleted}
        className={`w-full font-medium ${
          set.completed 
            ? "bg-accent-green text-white" 
            : "bg-accent-navy text-white hover:bg-accent-light-navy"
        }`}
      >
        {set.completed ? <Check size={16} className="mr-2" /> : <Circle size={16} className="mr-2" />}
        {set.completed ? "Completed" : "Mark Complete"}
      </Button>
    </div>
  );
}