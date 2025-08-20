import { useState, Fragment, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Save, Copy, Dumbbell, Check } from "lucide-react";
import ExerciseCard from "@/components/ExerciseCard";
import { storage } from "@/lib/storage";
import { Exercise, Workout, Template, InsertTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function determineWorkoutType(
  exercises: Exercise[]
): "strength" | "cardio" | "core" | "sports" {
  const uniqueTypes = Array.from(
    new Set(exercises.map((ex) => ex.type).filter(Boolean))
  );
  return uniqueTypes.length === 1
    ? (uniqueTypes[0] as "strength" | "cardio" | "core")
    : "sports";
}

interface WorkoutProps {
  onWorkoutSaved: () => void;
  initialTemplate?: Template;
  initialWorkout?: Workout | null;
}

export default function WorkoutPage({
  onWorkoutSaved,
  initialTemplate,
  initialWorkout,
}: WorkoutProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [todaysWorkouts, setTodaysWorkouts] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const { toast } = useToast();

  const [lastAddedExerciseId, setLastAddedExerciseId] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const groupExercises = (ex1: Exercise, ex2: Exercise) => {
    const groupId = ex1.groupId || ex2.groupId;

    const newGroupId =
      groupId || `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    setExercises((prev) =>
      prev.map((ex) => {
        const shouldJoinGroup =
          ex.id === ex1.id ||
          ex.id === ex2.id ||
          (ex.id === ex1.id && ex2.groupId) ||
          (ex.id === ex2.id && ex1.groupId);

        // If either ex is already in a group, add the other to it
        if (shouldJoinGroup) {
          return { ...ex, groupId: newGroupId };
        }

        return ex;
      })
    );
  };

  useEffect(() => {
    setTemplates(storage.getTemplates());
    loadTodaysWorkouts();

    if (initialWorkout) {
      setEditingWorkout(initialWorkout);
      setWorkoutName(initialWorkout.name);
      setExercises(initialWorkout.exercises);
      setWorkoutDate(initialWorkout.date.split("T")[0]);
      setWorkoutNotes(initialWorkout.notes || "");
    } else if (initialTemplate) {
      loadFromTemplate(initialTemplate);
    } else if (exercises.length === 0) {
      addExercise();
    }
  }, [initialTemplate, initialWorkout]);

  const loadTodaysWorkouts = () => {
    const today = new Date().toISOString().split("T")[0];
    const allWorkouts = storage.getWorkouts();
    setTodaysWorkouts(
      allWorkouts.filter((workout) => workout.date.split("T")[0] === today)
    );
  };

  const editWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setWorkoutName(workout.name);
    setExercises(workout.exercises);
    setWorkoutDate(workout.date.split("T")[0]);
    setWorkoutNotes(workout.notes || "");
    setLastAddedExerciseId(null);
  };

  const clearWorkout = () => {
    setEditingWorkout(null);
    setWorkoutName("");
    setExercises([]);
    setWorkoutDate(new Date().toISOString().split("T")[0]);
    setWorkoutNotes("");
    addExercise();
  };

  const loadFromTemplate = (template: Template) => {
    setWorkoutName(template.name);

    const templateExercises: Exercise[] = template.exercises.map(
      (templateEx) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: templateEx.name,
        type: templateEx.type || "strength",
        sets: Array.from({ length: templateEx.sets }, (_, index) => ({
          id: `${Date.now()}_${index}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          weight: templateEx.suggestedWeight,
          reps: templateEx.suggestedReps,
          duration: templateEx.suggestedDuration,
          distance: templateEx.suggestedDistance,
          completed: false,
        })),
      })
    );

    setExercises(templateExercises);
    setLastAddedExerciseId(null);
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: "",
      type: "strength", // Default type; will be updated when an exercise is selected
      sets: [],
    };
    setExercises((prevExercises) => [...prevExercises, newExercise]);
    setLastAddedExerciseId(newExercise.id);
  };

  const updateExercise = (
    exerciseId: string,
    updatedData: Partial<Exercise>
  ) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, ...updatedData } : ex
      )
    );
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises((prev) => {
      const toDelete = prev.find((ex) => ex.id === exerciseId);
      if (!toDelete) return prev;

      // If the exercise isn't part of a group, just delete it
      if (!toDelete.groupId) {
        return prev.filter((ex) => ex.id !== exerciseId);
      }

      // Count how many are in the same group
      const groupMembers = prev.filter((ex) => ex.groupId === toDelete.groupId);

      // If only 2 exercises, ungroup the remaining one
      if (groupMembers.length === 2) {
        return prev
          .map((ex) => {
            if (ex.id === exerciseId) return null;
            if (ex.groupId === toDelete.groupId) {
              return { ...ex, groupId: undefined, groupType: undefined };
            }
            return ex;
          })
          .filter(Boolean) as Exercise[];
      }

      // If more than 2, just remove the one
      return prev.filter((ex) => ex.id !== exerciseId);
    });
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      toast({
        title: "Workout Name Required",
        description: "Please enter a name for your workout.",
        variant: "destructive",
      });
      return;
    }

    const validExercises = exercises.filter(
      (ex) => ex.name.trim() && ex.sets.length > 0
    );
    if (validExercises.length === 0) {
      toast({
        title: "No Exercises Added",
        description: "Please add and complete at least one exercise.",
        variant: "destructive",
      });
      return;
    }

    const computedWorkoutType = determineWorkoutType(validExercises);

    const workout: Omit<Workout, "id"> = {
      name: workoutName,
      date: new Date(
        workoutDate + "T" + new Date().toTimeString().split(" ")[0]
      ).toISOString(),
      exercises: validExercises,
      type: computedWorkoutType,
      notes: workoutNotes,
    };

    try {
      if (editingWorkout) {
        storage.updateWorkout(editingWorkout.id, workout);
      } else {
        storage.createWorkout(workout);
      }

      const workoutDateOnly = workout.date.split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      if (workoutDateOnly === today) {
        localStorage.removeItem("congratsDismissedDate");
      }

      validExercises.forEach((exercise) => {
        if (exercise.type !== "strength") return;

        const completedSets = exercise.sets.filter(
          (set) => set.completed && (set.weight || 0) > 0 && (set.reps || 0) > 0
        );
        if (completedSets.length === 0) return;

        const bestSetInWorkout = completedSets.reduce((best, current) => {
          const best1RM = (best.weight || 0) * (1 + (best.reps || 0) / 30);
          const current1RM =
            (current.weight || 0) * (1 + (current.reps || 0) / 30);
          return current1RM > best1RM ? current : best;
        });

        const existingPB = storage
          .getPersonalBests()
          .find(
            (pb) =>
              pb.exerciseName.toLowerCase() === exercise.name.toLowerCase()
          );
        const newPbData = {
          weight: bestSetInWorkout.weight!,
          reps: bestSetInWorkout.reps!,
          date: new Date().toISOString(),
        };

        if (existingPB) {
          const existing1RM =
            (existingPB.weight || 0) * (1 + (existingPB.reps || 0) / 30);
          const new1RM =
            (newPbData.weight || 0) * (1 + (newPbData.reps || 0) / 30);

          if (new1RM > existing1RM) {
            storage.updatePersonalBest(existingPB.id, newPbData);
          }
        } else {
          storage.createPersonalBest({
            exerciseName: exercise.name.trim(),
            weight: newPbData.weight,
            reps: newPbData.reps,
            date: newPbData.date,
            type: newPbData.reps === 1 ? "1RM" : "volume",
          });
        }
      });

      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        loadTodaysWorkouts();
        clearWorkout();
        onWorkoutSaved();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workout.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsTemplate = () => {
    if (!workoutName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a workout name to use for the template.",
        variant: "destructive",
      });
      return;
    }

    const validExercises = exercises.filter((ex) => ex.name.trim());
    if (validExercises.length === 0) {
      toast({
        title: "Cannot Save Empty Workout",
        description: "Add some exercises before saving as a template.",
        variant: "destructive",
      });
      return;
    }

    const templateName = prompt(
      "Enter a name for your new template:",
      workoutName
    );
    if (!templateName) {
      return; // User cancelled
    }

    const computedWorkoutType = determineWorkoutType(validExercises);

    const newTemplate: InsertTemplate = {
      name: templateName,
      description: `Template created from '${workoutName}'`,
      type: computedWorkoutType,
      exercises: validExercises.map((ex) => {
        const firstSet = ex.sets[0];
        return {
          name: ex.name,
          sets: ex.sets.length,
          type: ex.type,
          suggestedWeight: firstSet?.weight,
          suggestedReps: firstSet?.reps,
          suggestedDuration: firstSet?.duration,
          suggestedDistance: firstSet?.distance,
        };
      }),
    };

    storage.createTemplate(newTemplate);
    setTemplates(storage.getTemplates()); // Refresh template list
    toast({
      title: "Template Saved!",
      description: `"${templateName}" has been added to your templates.`,
    });
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      <header className="bg-dark-secondary pt-[env(safe-area-inset-top,32px)] p-2 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Dumbbell className="text-accent-red mr-4" size={28} />
            <div>
              <div className="mt-2">
              <h2 className="text-xl font-bold text-text-primary font-heading">
                Log Workout
              </h2>
              <p className="text-text-secondary mt-1">
                Track your sets, reps, and weight.
              </p>
            </div>
            </div>
          </div>
          <div className="w-14 h-14 bg-dark-elevated rounded-full flex items-center justify-center overflow-hidden border-2 border-dark-border flex-shrink-0">
            <img
              src="/assets/icon.png"
              alt="Body Mastery Index Icon"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {todaysWorkouts.length > 0 && !editingWorkout && (
          <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
            <h3 className="text-lg font-semibold text-text-primary font-heading mb-3">
              Today's Workouts
            </h3>
            <div className="space-y-2">
              {todaysWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 bg-dark-elevated rounded-lg border border-dark-border"
                >
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {workout.name}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {workout.exercises.length} exercise
                      {workout.exercises.length !== 1 ? "s" : ""} •{" "}
                      {workout.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editWorkout(workout)}
                      className="bg-dark-elevated border-dark-border text-text-secondary hover:text-accent-red"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        storage.deleteWorkout(workout.id);
                        loadTodaysWorkouts();
                      }}
                      className="bg-dark-elevated border-dark-border text-red-500 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
          {editingWorkout && (
            <div className="mb-3 pb-3 border-b border-dark-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-accent-red font-semibold">
                  Editing: {editingWorkout.name}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearWorkout}
                  className="text-text-secondary hover:text-text-primary"
                >
                  Cancel Edit
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <label className="block text-text-secondary text-sm font-medium">
              Workout Name
            </label>
            <Button
              onClick={() => setShowTemplateDialog(true)}
              variant="outline"
              size="sm"
              className="bg-dark-elevated border-dark-border text-text-secondary hover:text-accent-red"
            >
              <Copy className="mr-1" size={14} /> From Template
            </Button>
          </div>
          <Input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="w-full bg-dark-elevated text-text-primary border-dark-border mb-3"
            placeholder="e.g., Push Day, Leg Day"
          />

          <div className="grid grid-cols-1 gap-3 mb-3">
            <div>
              <label className="text-text-secondary text-sm font-medium mb-1 block">
                Workout Date
              </label>
              <Input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="w-full bg-dark-elevated text-text-primary border-dark-border"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {(() => {
            const groupedById: Record<string, Exercise[]> = {};
            const ungrouped: Exercise[] = [];

            // Group exercises by groupId or leave ungrouped
            exercises.forEach((exercise) => {
              if (exercise.groupId) {
                if (!groupedById[exercise.groupId]) {
                  groupedById[exercise.groupId] = [];
                }
                groupedById[exercise.groupId].push(exercise);
              } else {
                ungrouped.push(exercise);
              }
            });

            const renderedIds = new Set<string>();
            const determineGroupType = (
              group: Exercise[]
            ): "superset" | "circuit" => {
              return group.length > 2 ? "circuit" : "superset";
            };

            return (
              <>
                {/* Grouped exercises (superset or circuit) */}
                {Object.entries(groupedById).map(([groupId, group]) => {
                  if (group.length < 2) return null;
                  const groupType = determineGroupType(group);
                  group.forEach((ex) => renderedIds.add(ex.id));

                  return (
                    <Fragment key={groupId}>
                      <div
                        className={cn(
                          "rounded-lg p-3 space-y-3 bg-dark-elevated",
                          groupType === "circuit"
                            ? "border-2 border-orange-500"
                            : "border-2 border-yellow-500"
                        )}
                      >
                        <h4
                          className={cn(
                            "font-semibold text-sm uppercase tracking-wide px-2",
                            groupType === "circuit"
                              ? "text-orange-400"
                              : "text-yellow-400"
                          )}
                        >
                          {groupType === "circuit" ? "Circuit" : "Superset"}
                        </h4>
                        {group.map((exercise) => (
                          <ExerciseCard
                            key={exercise.id}
                            exercise={{ ...exercise, groupType }}
                            onUpdate={(data) =>
                              updateExercise(exercise.id, data)
                            }
                            onDelete={() => deleteExercise(exercise.id)}
                            workoutExercises={exercises}
                            startOpen={exercise.id === lastAddedExerciseId}
                          />
                        ))}
                      </div>

                      {/* + Button outside the bordered group block */}
                      {ungrouped.length > 0 && (
                        <div className="flex justify-center mt-2 mb-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-accent-yellow border border-dark-border rounded-full hover:bg-dark-elevated"
                            onClick={() =>
                              groupExercises(group[0], ungrouped[0])
                            }
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      )}
                    </Fragment>
                  );
                })}

                {/* Ungrouped exercises with + buttons in between */}
                {ungrouped.map((exercise, index) => {
                  return (
                    <Fragment key={exercise.id}>
                      <ExerciseCard
                        exercise={exercise}
                        onUpdate={(data) => updateExercise(exercise.id, data)}
                        onDelete={() => deleteExercise(exercise.id)}
                        workoutExercises={exercises}
                        startOpen={exercise.id === lastAddedExerciseId}
                      />

                      {/* + Button to group with next */}
                      {index < ungrouped.length - 1 && (
                        <div className="flex justify-center my-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-accent-yellow border border-dark-border rounded-full hover:bg-dark-elevated"
                            onClick={() =>
                              groupExercises(
                                ungrouped[index],
                                ungrouped[index + 1]
                              )
                            }
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      )}
                    </Fragment>
                  );
                })}
              </>
            );
          })()}
        </div>

        <Button
          onClick={addExercise}
          variant="outline"
          className="w-full bg-dark-secondary hover:bg-dark-elevated border-dark-border text-text-secondary font-medium"
        >
          <Plus className="mr-2" size={16} />
          Add Another Exercise
        </Button>

        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
          <label className="block text-text-secondary text-sm font-medium mb-2">
            Workout Notes
          </label>
          <textarea
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="Add notes about your workout..."
            className="w-full bg-dark-elevated text-text-primary border border-dark-border rounded-lg p-3 text-sm resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleSaveAsTemplate}
            variant="outline"
            className="w-full bg-dark-elevated border-dark-border text-text-primary hover:bg-dark-border"
          >
            <Save className="mr-2" size={20} />
            Save as Template
          </Button>
          <Button
            onClick={saveWorkout}
            disabled={isSaving}
            className={cn(
              "w-full text-white font-semibold py-3 px-6 transition-all duration-300",
              isSaving
                ? "bg-accent-green"
                : "bg-accent-red hover:bg-accent-light-red"
            )}
          >
            {isSaving ? (
              <Check className="mr-2" size={20} />
            ) : (
              <Save className="mr-2" size={20} />
            )}
            {isSaving
              ? "Saved!"
              : editingWorkout
              ? "Update Workout"
              : "Save Workout"}
          </Button>
        </div>
      </div>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="bg-dark-secondary border-dark-border max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              Choose Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  loadFromTemplate(template);
                  setShowTemplateDialog(false);
                }}
                className="bg-dark-elevated rounded-lg p-3 border border-dark-border hover:border-accent-green transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-text-primary font-medium">
                      {template.name}
                    </h4>
                    <p className="text-text-secondary text-sm">
                      {template.description}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-text-disabled text-xs">
                        {template.exercises.length} exercises
                      </span>
                      {template.category && (
                        <span className="text-text-disabled text-xs bg-dark-primary px-2 py-1 rounded">
                          {template.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
