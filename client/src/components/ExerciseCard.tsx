import { useState, useEffect } from "react";
import { Exercise } from "@shared/schema";
import { ChevronDown, Trash2 } from "lucide-react";
import ExerciseForm from "@/components/ExerciseForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  workoutType: "strength" | "cardio" | "core" | "sports";
  onUpdate: (data: Partial<Exercise>) => void;
  onDelete: () => void;
  startOpen?: boolean;
}

export default function ExerciseCard({ exercise, workoutType, onUpdate, onDelete, startOpen = false }: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(startOpen || !exercise.name);

  useEffect(() => {
    if (startOpen) {
      setIsOpen(true);
    }
  }, [startOpen]);

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
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h4 className="font-semibold text-lg text-text-primary">
            {exercise.name || "Select an Exercise"}
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

      {isOpen && (
        <div className="p-4 border-t border-dark-border">
          <ExerciseForm
            exercise={exercise}
            onUpdate={(updatedExercise) => onUpdate(updatedExercise)}
            workoutType={workoutType} // Pass the workoutType down
          />
        </div>
      )}
    </div>
  );
}
