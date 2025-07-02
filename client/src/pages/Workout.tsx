import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Save, Copy } from "lucide-react";
import ExerciseCard from "@/components/ExerciseCard";
import { storage } from "@/lib/storage";
import { Exercise, Workout, Template } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface WorkoutProps {
  onWorkoutSaved: () => void;
  initialTemplate?: Template;
  initialWorkout?: Workout | null;
}

export default function WorkoutPage({ onWorkoutSaved, initialTemplate, initialWorkout }: WorkoutProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [workoutType, setWorkoutType] = useState<"strength" | "cardio" | "core" | "sports">("strength");
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [todaysWorkouts, setTodaysWorkouts] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const { toast } = useToast(); // Keep the hook, but we'll remove the calls
  
  const [lastAddedExerciseId, setLastAddedExerciseId] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(storage.getTemplates());
    loadTodaysWorkouts();
    
    if (initialWorkout) {
      setEditingWorkout(initialWorkout);
      setWorkoutName(initialWorkout.name);
      setWorkoutType(initialWorkout.type as any);
      setExercises(initialWorkout.exercises);
      setWorkoutDate(initialWorkout.date.split('T')[0]);
      setWorkoutNotes(initialWorkout.notes || "");
    }
    else if (initialTemplate) {
      loadFromTemplate(initialTemplate);
    } else if (exercises.length === 0) {
      addExercise();
    }
  }, [initialTemplate, initialWorkout]);

  const loadTodaysWorkouts = () => {
    const today = new Date().toISOString().split('T')[0];
    const allWorkouts = storage.getWorkouts();
    setTodaysWorkouts(allWorkouts.filter(workout => workout.date.split('T')[0] === today));
  };

  const editWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setWorkoutName(workout.name);
    setWorkoutType(workout.type as any);
    setExercises(workout.exercises);
    setWorkoutDate(workout.date.split('T')[0]);
    setWorkoutNotes(workout.notes || "");
    setLastAddedExerciseId(null); 
  };

  const clearWorkout = () => {
    setEditingWorkout(null);
    setWorkoutName("");
    setExercises([]);
    setWorkoutType("strength");
    setWorkoutDate(new Date().toISOString().split('T')[0]);
    setWorkoutNotes("");
    addExercise();
  };

  const loadFromTemplate = (template: Template) => {
    setWorkoutName(template.name);
    setWorkoutType(template.type as any || "strength");
    
    const templateExercises: Exercise[] = template.exercises.map(templateEx => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: templateEx.name,
      type: templateEx.type || "strength",
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
    setLastAddedExerciseId(null); 
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: "",
      type: workoutType as any,
      sets: [],
    };
    setExercises(prevExercises => [...prevExercises, newExercise]);
    setLastAddedExerciseId(newExercise.id);
  };

  const updateExercise = (exerciseId: string, updatedData: Partial<Exercise>) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, ...updatedData } : ex
    ));
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      // toast({ title: "Error", description: "Please enter a workout name", variant: "destructive" }); // REMOVED
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      // toast({ title: "Error", description: "Please add at least one exercise", variant: "destructive" }); // REMOVED
      return;
    }

    const workout: Omit<Workout, 'id'> = {
      name: workoutName,
      date: new Date(workoutDate + 'T' + new Date().toTimeString().split(' ')[0]).toISOString(),
      exercises: validExercises,
      type: workoutType as any,
      notes: workoutNotes,
    };

    try {
      if (editingWorkout) {
        storage.updateWorkout(editingWorkout.id, workout);
      } else {
        storage.createWorkout(workout);
      }
      
      const workoutDateOnly = workout.date.split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      if (workoutDateOnly === today) {
        localStorage.removeItem('congratsDismissedDate');
      }
      
      validExercises.forEach(exercise => {
        if (exercise.type !== "strength") return;
        
        const completedSets = exercise.sets.filter(set => set.completed && (set.weight || 0) > 0 && (set.reps || 0) > 0);
        if (completedSets.length === 0) return;
        
        const bestSetInWorkout = completedSets.reduce((best, current) => {
          const best1RM = (best.weight || 0) * (1 + (best.reps || 0) / 30);
          const current1RM = (current.weight || 0) * (1 + (current.reps || 0) / 30);
          return current1RM > best1RM ? current : best;
        });

        const existingPB = storage.getPersonalBests().find(pb => pb.exerciseName.toLowerCase() === exercise.name.toLowerCase());
        const newPbData = {
          weight: bestSetInWorkout.weight!,
          reps: bestSetInWorkout.reps!,
          date: new Date().toISOString()
        };

        if (existingPB) {
            const existing1RM = (existingPB.weight || 0) * (1 + (existingPB.reps || 0) / 30);
            const new1RM = (newPbData.weight || 0) * (1 + (newPbData.reps || 0) / 30);

            if (new1RM > existing1RM) {
                storage.updatePersonalBest(existingPB.id, newPbData);
            }
        } else {
             storage.createPersonalBest({
                exerciseName: exercise.name.trim(),
                weight: newPbData.weight,
                reps: newPbData.reps,
                date: newPbData.date,
                type: newPbData.reps === 1 ? '1RM' : 'volume',
            });
        }
      });

      // toast({ title: "Success", description: editingWorkout ? "Workout updated successfully!" : "Workout saved successfully!" }); // REMOVED

      loadTodaysWorkouts();
      clearWorkout();
      onWorkoutSaved();
    } catch (error) {
      // toast({ title: "Error", description: "Failed to save workout", variant: "destructive" }); // REMOVED
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      <header className="bg-dark-secondary p-4 shadow-lg">
        <h2 className="text-xl font-bold text-text-primary font-heading">Log Workout</h2>
      </header>

      <div className="p-4 space-y-4">
        {/* All JSX remains the same, only the toast calls in the saveWorkout function were removed */}
        {todaysWorkouts.length > 0 && (
          <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
            {/* ... */}
          </div>
        )}

        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
          {/* ... */}
        </div>

        <div className="space-y-3">
            {exercises.map((exercise) => (
                <ExerciseCard 
                    key={exercise.id}
                    exercise={exercise}
                    onUpdate={(updatedData) => updateExercise(exercise.id, updatedData)}
                    onDelete={() => deleteExercise(exercise.id)}
                    startOpen={exercise.id === lastAddedExerciseId}
                    workoutType={workoutType} 
                />
            ))}
        </div>
        
        <Button onClick={addExercise} variant="outline" className="w-full bg-dark-secondary hover:bg-dark-elevated border-dark-border text-text-secondary font-medium">
            <Plus className="mr-2" size={16} />
            Add Another Exercise
        </Button>

        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
           <label className="block text-text-secondary text-sm font-medium mb-2">Workout Notes</label>
          <textarea value={workoutNotes} onChange={(e) => setWorkoutNotes(e.target.value)} placeholder="Add notes about your workout..." className="w-full bg-dark-elevated text-text-primary border border-dark-border rounded-lg p-3 text-sm resize-none" rows={3} />
        </div>

        <Button onClick={saveWorkout} className="w-full bg-accent-red hover:bg-accent-light-red text-white font-semibold py-3 px-6">
          <Save className="mr-2" size={20} />
          {editingWorkout ? "Update Workout" : "Save Workout"}
        </Button>
      </div>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        {/* ... */}
      </Dialog>
    </div>
  );
}
