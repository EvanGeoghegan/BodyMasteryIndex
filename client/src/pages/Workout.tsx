import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Save, Copy, Dumbbell, Check } from "lucide-react"; // Import Check icon
import ExerciseCard from "@/components/ExerciseCard";
import { storage } from "@/lib/storage";
import { Exercise, Workout, Template } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Import cn utility

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
  const { toast } = useToast();

  const [lastAddedExerciseId, setLastAddedExerciseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // State for save confirmation

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
      alert("Please enter a workout name");
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      alert("Please add at least one exercise");
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

      // --- NEW: Trigger the save confirmation state ---
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        loadTodaysWorkouts();
        clearWorkout();
        onWorkoutSaved();
      }, 1000); // Show confirmation for 1 second

    } catch (error) {
      alert("Failed to save workout");
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      <header className="bg-dark-secondary p-2 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left side: Page Icon + Title */}
          <div className="flex items-center">
            <Dumbbell className="text-accent-red mr-4" size={28} />
            <div>
              <h2 className="text-xl font-bold text-text-primary font-heading">
                Log Workout
              </h2>
              <p className="text-text-secondary mt-1">Track your sets, reps, and weight.</p>
            </div>
          </div>

          {/* Right side: App Logo */}
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
        {todaysWorkouts.length > 0 && (
          <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
            <h3 className="text-lg font-semibold text-text-primary font-heading mb-3">Today's Workouts</h3>
            <div className="space-y-2">
              {todaysWorkouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-dark-elevated rounded-lg border border-dark-border">
                  <div>
                    <h4 className="font-medium text-text-primary">{workout.name}</h4>
                    <p className="text-sm text-text-secondary">
                      {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''} • {workout.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => editWorkout(workout)} className="bg-dark-elevated border-dark-border text-text-secondary hover:text-accent-red">Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => { storage.deleteWorkout(workout.id); loadTodaysWorkouts(); }} className="bg-dark-elevated border-dark-border text-red-500 hover:text-red-700">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
            {editingWorkout && (
              <div className="mt-3 pt-3 border-t border-dark-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-accent-red">Editing: {editingWorkout.name}</p>
                  <Button variant="ghost" size="sm" onClick={clearWorkout} className="text-text-secondary hover:text-text-primary">Cancel Edit</Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-text-secondary text-sm font-medium">
              Workout Name
            </label>
            <Button onClick={() => setShowTemplateDialog(true)} variant="outline" size="sm" className="bg-dark-elevated border-dark-border text-text-secondary hover:text-accent-navy">
              <Copy className="mr-1" size={14} /> From Template
            </Button>
          </div>
          <Input value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} className="w-full bg-dark-elevated text-text-primary border-dark-border mb-3" placeholder="e.g., Push Day, Leg Day" />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-text-secondary text-sm font-medium mb-1 block">Workout Date</label>
              <Input type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} className="w-full bg-dark-elevated text-text-primary border-dark-border" />
            </div>
            <div>
              <label className="text-text-secondary text-sm font-medium mb-1 block">Workout Type</label>
              <Select value={workoutType} onValueChange={(value: "strength" | "cardio" | "core" | "sports") => setWorkoutType(value)}>
                <SelectTrigger className="w-full bg-dark-elevated text-text-primary border-dark-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-secondary border-dark-border">
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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

        {/* --- UPDATED: Save button with confirmation effect --- */}
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
          {isSaving ? "Saved!" : editingWorkout ? "Update Workout" : "Save Workout"}
        </Button>
      </div>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="bg-dark-secondary border-dark-border max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Choose Template</DialogTitle>
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
                    <h4 className="text-text-primary font-medium">{template.name}</h4>
                    <p className="text-text-secondary text-sm">{template.description}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-text-disabled text-xs">{template.exercises.length} exercises</span>
                      {template.category && (<span className="text-text-disabled text-xs bg-dark-primary px-2 py-1 rounded">{template.category}</span>)}
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
