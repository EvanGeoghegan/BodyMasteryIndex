import { useState, useEffect } from "react";
import { Exercise, ExerciseSet } from "@shared/schema";
import { ChevronDown, Trash2, Plus, Check, Circle, Info } from "lucide-react";
import ExerciseCombobox from "./ExerciseCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import masterExerciseList from "@/lib/exercises.json";
import { storage } from "@/lib/storage";
import { equipmentIcons } from "@/icons/equipmentIcons";

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (data: Partial<Exercise>) => void;
  onDelete: () => void;
  startOpen?: boolean;
  workoutExercises?: Exercise[];
}

interface LastPerformance {
  weight: number;
  reps: number;
  date: string;
}

export default function ExerciseCard({
  exercise,
  onUpdate,
  onDelete,
  startOpen = false,
  workoutExercises = [],
}: ExerciseCardProps) {
  const otherExercises =
    workoutExercises?.filter((ex) => ex.id !== exercise.id) || [];
  const [isOpen, setIsOpen] = useState(startOpen || !exercise.name);
  const [lastPerformance, setLastPerformance] =
    useState<LastPerformance | null>(null);

  useEffect(() => {
    if (startOpen && !exercise.name) {
      setIsOpen(true);
    }
  }, [startOpen, exercise.name]);

  useEffect(() => {
    if (exercise.name) {
      const lastPerf = storage.getLastPerformance(exercise.name);
      setLastPerformance(lastPerf);
    } else {
      setLastPerformance(null);
    }
  }, [exercise.name]);

  const handleExerciseSelect = (exerciseName: string) => {
    const selected = masterExerciseList.find((ex) => ex.name === exerciseName);
    const category = selected ? selected.category : exercise.type;

    const updates: Partial<Exercise> = {
      name: exerciseName,
      type: category as any,
      equipment: Array.isArray(selected?.equipment)
        ? selected?.equipment
        : selected?.equipment
        ? [selected.equipment]
        : [],
    };

    if (exercise.sets.length === 0) {
      const newSet: ExerciseSet = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        completed: false,
      };
      updates.sets = [newSet];
    }

    onUpdate({
      ...exercise,
      ...updates,
    });
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

    if (currentCategory === "strength") {
      newSet.weight = lastSet?.weight || 0;
      newSet.reps = lastSet?.reps || 0;
    } else if (currentCategory === "core") {
      newSet.reps = lastSet?.reps || 0;
      newSet.duration = lastSet?.duration || 0;
    } else {
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

  const getSetSummary = () => {
    if (exercise.sets.length === 0) return "0 sets";
    const completedSets = exercise.sets.filter((set) => set.completed).length;
    return `${completedSets} / ${exercise.sets.length} sets`;
  };

  const isCardComplete =
    exercise.sets.length > 0 && exercise.sets.every((set) => set.completed);
  const displayCategory = exercise.type as string;

  const getBorderColorClass = () => {
    // --- FIX: Default to a white border instead of transparent ---
    if (!exercise.name) return "border-l-white";
    switch (displayCategory) {
      case "strength":
        return "border-l-blue-500";
      case "cardio":
        return "border-l-green-500";
      case "core":
        return "border-l-orange-500";
      case "sports":
        return "border-l-purple-500";
      default:
        return "border-l-white"; // Fallback to white
    }
  };

  const getCompletionBgClass = () => {
    if (!isCardComplete) return "";
    switch (displayCategory) {
      case "strength":
        return "bg-blue-900/30";
      case "cardio":
        return "bg-green-900/30";
      case "core":
        return "bg-orange-900/30";
      case "sports":
        return "bg-purple-900/30";
      default:
        return "";
    }
  };

  const getGroupLabel = () => {
    if (!exercise.groupType || !exercise.groupId) return null;
    return exercise.groupType === "circuit" ? "Circuit" : "Superset";
  };

  return (
    <div
      className={cn(
        "bg-dark-elevated rounded-xl border-l-4 border-t border-r border-b transition-all duration-300",
        getBorderColorClass(),
        getCompletionBgClass(),
        isOpen
          ? "border-t-accent-red/50 border-r-accent-red/50 border-b-accent-red/50"
          : "border-t-dark-border border-r-dark-border border-b-dark-border"
      )}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
            <h4 className="font-semibold text-lg text-text-primary">
              {exercise.name?.trim() || "Select an Exercise"}
            </h4>

          {getGroupLabel() && (
            <p className="text-xs text-accent-yellow mt-1">{getGroupLabel()}</p>
          )}

          <span
            className={cn(
              "text-sm px-2 py-0.5 rounded-full mt-1 inline-block",
              isCardComplete
                ? "bg-accent-green/20 text-accent-green"
                : "text-text-secondary bg-dark-primary"
            )}
          >
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
            className={cn(
              "h-6 w-6 text-text-secondary transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {lastPerformance && isOpen && (
        <div className="flex items-center gap-2 text-xs text-text-secondary bg-dark-elevated px-2 py-1 rounded-md mt-2">
          <Info size={14} className="text-accent-blue" />
          <span>
            Last time: {lastPerformance.weight}kg x {lastPerformance.reps} reps
            on {new Date(lastPerformance.date).toLocaleDateString()}
          </span>
        </div>
      )}

      {isOpen && (
        <div className="p-4 border-t border-dark-border space-y-4">
          {!exercise.name && (
            <ExerciseCombobox
              value={exercise.name}
              onSelect={handleExerciseSelect}
            />
          )}

          {exercise.name && (
            <>
              {exercise.equipment && (
                <div className="flex gap-2 mt-1 text-muted-foreground">
                  {exercise.equipment.map((item: string, index: number) => {
                    const Icon =
                      equipmentIcons[item.toLowerCase()] ??
                      equipmentIcons["bodyweight"];
                    return (
                      <div key={index} title={item}>
                        <Icon className="h-4 w-4" />
                      </div>
                    );
                  })}
                </div>
              )}

              {exercise.groupId && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => onUpdate({ groupId: undefined })}
                    className="text-red-500 text-sm hover:text-red-600"
                  >
                    {exercise.groupType === "circuit"
                      ? "Remove from Circuit"
                      : "Ungroup from Superset"}
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2 text-xs text-text-secondary mb-1 opacity-70">
                <span className="text-text-secondary w-8 text-left">Set</span>
                {displayCategory === "strength" && (
                  <>
                    <span className="text-text-secondary flex-1">Weight</span>
                    <span className="text-text-secondary flex-1">Reps</span>
                  </>
                )}
                {displayCategory === "core" && (
                  <>
                    <span className="text-text-secondary flex-1">Reps</span>
                    <span className="text-text-secondary flex-1">
                      Duration (s)
                    </span>
                  </>
                )}
                {(displayCategory === "cardio" ||
                  displayCategory === "sports") && (
                  <>
                    <span className="text-text-secondary flex-1">
                      Duration (min)
                    </span>
                    <span className="text-text-secondary flex-1">
                      Distance (km)
                    </span>
                  </>
                )}
                <span className="text-text-secondary w-12">Done</span>
                <span className="w-8"></span>
              </div>

              <div className="space-y-2">
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="flex items-center space-x-2">
                    <span className="text-text-primary w-8 text-center text-sm">
                      {index + 1}
                    </span>
                    {displayCategory === "strength" && (
                      <>
                        <Input
                          type="number"
                          value={set.weight || ""}
                          onChange={(e) =>
                            updateSet(index, {
                              weight: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border"
                          placeholder="kg"
                        />
                        <Input
                          type="number"
                          value={set.reps || ""}
                          onChange={(e) =>
                            updateSet(index, {
                              reps: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border"
                          placeholder="reps"
                        />
                      </>
                    )}
                    {displayCategory === "core" && (
                      <>
                        <Input
                          type="number"
                          value={set.reps || ""}
                          onChange={(e) =>
                            updateSet(index, {
                              reps: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border"
                          placeholder="reps"
                        />
                        <Input
                          type="number"
                          value={set.duration || ""}
                          onChange={(e) =>
                            updateSet(index, {
                              duration: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border"
                          placeholder="sec"
                        />
                      </>
                    )}
                    {(displayCategory === "cardio" ||
                      displayCategory === "sports") && (
                      <>
                        <Input
                          type="number"
                          value={set.duration || ""}
                          onChange={(e) =>
                            updateSet(index, {
                              duration: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border"
                          placeholder="min"
                        />
                        <Input
                          type="number"
                          step="0.1"
                          value={set.distance || ""}
                          onChange={(e) =>
                            updateSet(index, {
                              distance: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full flex-1 bg-dark-primary text-center p-1 rounded-md border-dark-border"
                          placeholder="km"
                        />
                      </>
                    )}
                    <Button
                      onClick={() => toggleSetCompleted(index)}
                      variant="ghost"
                      size="sm"
                      className={`w-12 h-8 flex items-center justify-center rounded-md ${
                        set.completed
                          ? "text-accent-green bg-accent-green/10"
                          : "text-text-secondary"
                      }`}
                    >
                      {set.completed ? (
                        <Check size={16} />
                      ) : (
                        <Circle size={16} />
                      )}
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
                onClick={() => addSet()}
                variant="ghost"
                className="text-accent-green hover:text-green-400 text-sm font-medium p-0 h-auto"
              >
                <Plus className="mr-1" size={16} /> Add Set
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
