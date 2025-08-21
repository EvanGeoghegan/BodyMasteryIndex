import React, { useEffect, useState } from "react";
import UnifiedMuscleHeatmap from "@/components/muscle-map/UnifiedMuscleHeatmap";
import { storage } from "@/lib/storage";
import exercisesData from "@/lib/exercises.json"; // Adjust this path if needed

const muscleLabelMap: { [key: string]: string } = {
  latissimus_dorsi_anterior: "Latissimus Dorsi",
  latissimus_dorsi_posterior: "Latissimus Dorsi",
  rectus_abdominus: "Rectus Abdominus",
  gluteus_posterior: "Glutes",
  gluteus_anterior: "Glutes",
  quadriceps_anterior: "Quadriceps",
  hamstrings: "Hamstrings",
  biceps: "Biceps",
  triceps: "Triceps",
  deltoids_anterior: "Deltoids",
  wrist_flexors: "Wrist Flexors",
  wrist_extensors: "Wrist Extensors",
  pectoralis: "Pectoralis",
  calves: "Calves",
  obliques_anterior: "Obliques",
  obliques_posterior: "Obliques",
  neck_anterior: "Neck",
  neck_posterior: "Neck",
  rhomboids: "Rhomboids",
  trapezius_anterior: "Trapezius",
  trapezius_posterior: "Trapezius",
  tibialis_anterior: "Tibialis Anterior",
  // Add more as needed
};

const FullBodyHeatmap = () => {
  const [fillOverrides, setFillOverrides] = useState<{ [key: string]: string }>(
    {}
  );

  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [matchedExercises, setMatchedExercises] = useState<string[]>([]);

  useEffect(() => {
    const workouts = storage.getWorkouts(); // This uses your existing system
    const recentMuscleDates: { [muscle: string]: string } = {};

    workouts.forEach((workout) => {
      const workoutDate = workout.date.split("T")[0];

      workout.exercises.forEach((ex) => {
        const matchingExercise = exercisesData.find((e) => e.name === ex.name);
        if (!matchingExercise || !matchingExercise.musclesWorked) return;

        matchingExercise.musclesWorked.forEach((muscle: string) => {
          if (
            !recentMuscleDates[muscle] ||
            new Date(workoutDate) > new Date(recentMuscleDates[muscle])
          ) {
            recentMuscleDates[muscle] = workoutDate;
          }
        });
      });
    });

    const today = new Date();
    const overrides: { [muscle: string]: string } = {};

    Object.entries(recentMuscleDates).forEach(([muscle, dateStr]) => {
      const lastWorked = new Date(dateStr);
      const diffDays = Math.floor(
        (today.getTime() - lastWorked.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 2) {
        overrides[muscle] = "#ff0000"; // red
      } else if (diffDays <= 7) {
        overrides[muscle] = "#ffa500"; // orange
      }
      // else: no override = default grey
    });

    setFillOverrides(overrides);
  }, []);
  const handleMuscleClick = (muscleId: string) => {
    const color = fillOverrides[muscleId];
    if (!color) return; // Not trained recently

    const recentWorkouts = storage.getWorkouts();
    const recentExercises = new Set<string>();

    recentWorkouts.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        const matchingExercise = exercisesData.find((e) => e.name === ex.name);
        if (!matchingExercise || !matchingExercise.musclesWorked) return;

        if (matchingExercise.musclesWorked.includes(muscleId)) {
          recentExercises.add(ex.name);
        }
      });
    });

    setSelectedMuscle(muscleId);
    setMatchedExercises(Array.from(recentExercises));
  };

  return (
    <div className="p-4 max-w-[650px] mx-auto">
      <h2 className="text-xl font-semibold mb-1">Muscle Heatmap</h2>
      <p className="text-sm text-gray-600 mb-2">
        Color-coded by how recently each muscle group was trained.
      </p>

      {/* Border and padding wrapper */}
      <div className="bg-dark-secondary border border-dark-border rounded-lg p-4">
        <UnifiedMuscleHeatmap
          fillOverrides={fillOverrides}
          onMuscleClick={handleMuscleClick}
        />
        {selectedMuscle && matchedExercises.length > 0 && (
          <div className="mt-4 bg-dark-secondary border border-dark-border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-semibold text-text-primary">
                Exercises that trained:{" "}
                <span className="text-accent-red">
                  {muscleLabelMap[selectedMuscle] || selectedMuscle}
                </span>
              </h4>
              <button
                onClick={() => setSelectedMuscle(null)}
                className="text-text-secondary hover:text-accent-red text-sm ml-4"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-text-secondary">
              {matchedExercises.map((exercise) => (
                <div key={exercise}>• {exercise}</div>
              ))}
            </div>
          </div>
        )}

        {/* LEGEND */}
        <div className="mt-4 flex gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#ff0000]" />
            <span>Last 2 Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#ffa500]" />
            <span>Last 7 Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#bfbfbf]" />
            <span>Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullBodyHeatmap;
