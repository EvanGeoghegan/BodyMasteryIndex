import React from "react";
import UnifiedMuscleHeatmap from "@/components/muscle-map/UnifiedMuscleHeatmap";

const anteriorOverrides = {
  pectoralis: "#ff0000",
  rectus_abdominus: "#ffa500",
  quadriceps_anterior: "#cccccc",
  tibialis_anterior: "#9999ff",
};

const posteriorOverrides = {
  gluteus_posterior: "#ff0000",
  hamstrings: "#ffa500",
  calves: "#cccccc",
  triceps: "#9999ff",
  wrist_extensors: "#6666ff",
};

const FullBodyHeatmap = () => {
  return (
    <div className="p-4 max-w-[650px] mx-auto">
      <h2 className="text-xl font-semibold mb-1">Muscle Heatmap</h2>
      <p className="text-sm text-gray-600 mb-2">Visual test layout</p>
      <UnifiedMuscleHeatmap />
    </div>
  );
};

export default FullBodyHeatmap;
