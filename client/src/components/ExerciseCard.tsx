import { useState } from "react";
import { Exercise } from "@shared/schema";
import { ChevronDown, Trash2 } from "lucide-react";
import ExerciseForm from "@/components/ExerciseForm";
import CardioExerciseForm from "@/components/CardioExerciseForm";
import CoreExerciseForm from "@/components/CoreExerciseForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
  onDelete: () => void;
}

export default function ExerciseCard({ exercise, onUpdate, onDelete }: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      {/* --- Card Header / Trigger --- */}
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
                  e.stopPropagation(); // Prevents the card from expanding when deleting
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

      {/* --- Collapsible Content --- */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-dark-border">
          {exercise.type === "cardio" ? (
            <CardioExerciseForm
              exercise={exercise}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ) : exercise.type === "core" ? (
            <CoreExerciseForm
              exercise={exercise}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ) : (
            <ExerciseForm
              exercise={exercise}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}
