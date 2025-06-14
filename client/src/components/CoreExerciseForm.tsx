import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Check, Timer } from "lucide-react";
import { Exercise, ExerciseSet } from "@shared/schema";
import { nanoid } from "nanoid";

interface CoreExerciseFormProps {
  exercise: Exercise;
  onUpdate: (exercise: Exercise) => void;
  onDelete: () => void;
}

export default function CoreExerciseForm({ exercise, onUpdate, onDelete }: CoreExerciseFormProps) {
  const [showRestTimer, setShowRestTimer] = useState(false);

  const addSet = () => {
    const newSet: ExerciseSet = {
      id: nanoid(),
      reps: 10,
      weight: 0,
      duration: 30, // Default 30 seconds for core exercises
      distance: 0,
      completed: false,
      restTime: 60, // Default 60 seconds rest
    };

    onUpdate({
      ...exercise,
      sets: [...exercise.sets, newSet],
    });
  };

  const updateSet = (setId: string, updates: Partial<ExerciseSet>) => {
    onUpdate({
      ...exercise,
      sets: exercise.sets.map(set =>
        set.id === setId ? { ...set, ...updates } : set
      ),
    });
  };

  const deleteSet = (setId: string) => {
    onUpdate({
      ...exercise,
      sets: exercise.sets.filter(set => set.id !== setId),
    });
  };

  const updateExerciseName = (name: string) => {
    onUpdate({ ...exercise, name });
  };

  const updateNotes = (notes: string) => {
    onUpdate({ ...exercise, notes });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <Input
            value={exercise.name}
            onChange={(e) => updateExerciseName(e.target.value)}
            placeholder="Exercise name"
            className="font-semibold text-lg border-none p-0 h-auto bg-transparent focus-visible:ring-0"
          />
          <Badge variant="secondary" className="mt-1">
            Core
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Sets</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addSet}
              className="h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Set
            </Button>
          </div>

          {exercise.sets.map((set, index) => (
            <div key={set.id} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium w-8">{index + 1}</span>
              
              {/* Duration or Reps */}
              <div className="flex-1">
                <Label className="text-xs text-gray-600 dark:text-gray-400">Duration (sec)</Label>
                <Input
                  type="number"
                  value={set.duration || ""}
                  onChange={(e) => updateSet(set.id, { duration: Number(e.target.value) || 0 })}
                  placeholder="30"
                  className="h-8"
                />
              </div>

              <div className="text-xs text-gray-500 px-2">or</div>

              <div className="flex-1">
                <Label className="text-xs text-gray-600 dark:text-gray-400">Reps</Label>
                <Input
                  type="number"
                  value={set.reps || ""}
                  onChange={(e) => updateSet(set.id, { reps: Number(e.target.value) || 0 })}
                  placeholder="10"
                  className="h-8"
                />
              </div>

              {/* Rest Time */}
              <div className="flex-1">
                <Label className="text-xs text-gray-600 dark:text-gray-400">Rest (sec)</Label>
                <Input
                  type="number"
                  value={set.restTime || ""}
                  onChange={(e) => updateSet(set.id, { restTime: Number(e.target.value) || 0 })}
                  placeholder="60"
                  className="h-8"
                />
              </div>

              {/* Complete/Timer buttons */}
              <div className="flex gap-1">
                <Button
                  variant={set.completed ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSet(set.id, { completed: !set.completed })}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRestTimer(true)}
                  className="h-8 w-8 p-0"
                >
                  <Timer className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSet(set.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <Label className="text-sm font-medium">Notes</Label>
          <Textarea
            value={exercise.notes || ""}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Exercise notes..."
            className="mt-1"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}