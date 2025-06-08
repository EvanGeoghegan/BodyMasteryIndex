import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Save, Copy } from "lucide-react";
import ExerciseForm from "@/components/ExerciseForm";
import { storage } from "@/lib/storage";
import { Exercise, ExerciseSet, Workout, Template } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface WorkoutProps {
  onWorkoutSaved: () => void;
  initialTemplate?: Template;
}

export default function WorkoutPage({ onWorkoutSaved, initialTemplate }: WorkoutProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [workoutType, setWorkoutType] = useState<"strength" | "cardio" | "mixed">("strength");
  const { toast } = useToast();

  useEffect(() => {
    setTemplates(storage.getTemplates());
    
    // Initialize from template if provided
    if (initialTemplate) {
      loadFromTemplate(initialTemplate);
    } else if (exercises.length === 0) {
      addExercise();
    }
  }, [initialTemplate]);

  const loadFromTemplate = (template: Template) => {
    setWorkoutName(template.name);
    setWorkoutType(template.type || "strength");
    
    const templateExercises: Exercise[] = template.exercises.map(templateEx => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: templateEx.name,
      type: templateEx.type || "strength",
      cardioType: templateEx.cardioType,
      sets: Array.from({ length: templateEx.sets }, (_, index) => ({
        id: `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        weight: templateEx.suggestedWeight,
        reps: templateEx.suggestedReps,
        duration: templateEx.suggestedDuration,
        distance: templateEx.suggestedDistance,
        completed: false,
      }))
    }));
    
    setExercises(templateExercises);
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: "",
      type: "strength",
      sets: [
        {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          weight: 0,
          reps: 0,
          completed: false,
        }
      ],
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (exerciseIndex: number, updatedExercise: Exercise) => {
    const updatedExercises = exercises.map((exercise, index) =>
      index === exerciseIndex ? updatedExercise : exercise
    );
    setExercises(updatedExercises);
  };

  const deleteExercise = (exerciseIndex: number) => {
    const updatedExercises = exercises.filter((_, index) => index !== exerciseIndex);
    setExercises(updatedExercises);
  };

  const startRestTimer = (time: number) => {
    setRestTime(time);
    setShowRestTimer(true);
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workout name",
        variant: "destructive",
      });
      return;
    }

    if (exercises.length === 0 || exercises.every(ex => !ex.name.trim())) {
      toast({
        title: "Error",
        description: "Please add at least one exercise",
        variant: "destructive",
      });
      return;
    }

    const duration = startTime ? Math.round((Date.now() - startTime.getTime()) / (1000 * 60)) : undefined;

    const workout: Omit<Workout, 'id'> = {
      name: workoutName,
      date: new Date().toISOString(),
      exercises: exercises.filter(ex => ex.name.trim()), // Only save exercises with names
      duration,
    };

    try {
      storage.createWorkout(workout);
      
      // Update personal bests
      exercises.forEach(exercise => {
        if (!exercise.name.trim()) return;
        
        exercise.sets.forEach(set => {
          if (set.completed && set.weight > 0 && set.reps > 0) {
            const existingBests = storage.getPersonalBests()
              .filter(pb => pb.exerciseName.toLowerCase() === exercise.name.toLowerCase());
            
            const currentMax = existingBests.find(pb => pb.type === '1RM');
            const estimated1RM = set.weight * (1 + set.reps / 30); // Epley formula approximation
            
            if (!currentMax || estimated1RM > currentMax.weight) {
              storage.createPersonalBest({
                exerciseName: exercise.name,
                weight: set.weight,
                reps: set.reps,
                date: new Date().toISOString(),
                type: set.reps === 1 ? '1RM' : 'volume',
              });
            }
          }
        });
      });

      toast({
        title: "Success",
        description: "Workout saved successfully!",
      });

      // Reset form
      setWorkoutName("");
      setExercises([]);
      setStartTime(new Date());
      addExercise();
      
      onWorkoutSaved();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      <header className="bg-dark-secondary p-4 shadow-lg">
        <h2 className="text-xl font-bold text-text-primary">Log Workout</h2>
      </header>

      <div className="p-4 space-y-4">
        {/* Workout Name */}
        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
          <label className="block text-text-secondary text-sm font-medium mb-2">
            Workout Name
          </label>
          <Input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="w-full bg-dark-elevated text-text-primary border-dark-border"
            placeholder="e.g., Push Day, Leg Day"
          />
        </div>

        {/* Exercise List */}
        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Exercises</h3>
            <Button
              onClick={addExercise}
              className="bg-accent-green hover:bg-green-500 text-dark-primary px-4 py-2"
            >
              <Plus className="mr-1" size={16} />
              Add Exercise
            </Button>
          </div>

          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <ExerciseForm
                key={exercise.id}
                exercise={exercise}
                onUpdate={(updatedExercise) => updateExercise(index, updatedExercise)}
                onDelete={() => deleteExercise(index)}
                onStartRest={startRestTimer}
              />
            ))}
          </div>
        </div>

        {/* Rest Timer Section */}
        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Rest Timer</h3>
              <p className="text-text-secondary text-sm">Between sets</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-green">
                {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}
              </div>
              <Button
                onClick={() => startRestTimer(restTime)}
                className="bg-accent-green hover:bg-green-500 text-dark-primary px-4 py-1 text-sm mt-1"
              >
                <Timer className="mr-1" size={14} />
                Start Timer
              </Button>
            </div>
          </div>
        </div>

        {/* Save Workout */}
        <Button
          onClick={saveWorkout}
          className="w-full bg-accent-green hover:bg-green-500 text-dark-primary font-semibold py-3 px-6"
        >
          <Save className="mr-2" size={20} />
          Save Workout
        </Button>
      </div>

      <RestTimer
        isOpen={showRestTimer}
        onClose={() => setShowRestTimer(false)}
        initialTime={restTime}
      />
    </div>
  );
}
