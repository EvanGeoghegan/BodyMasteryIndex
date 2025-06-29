import { useState, useEffect } from "react";
// ... all other imports are unchanged

export default function Supplements() {
  const [proteinGoal, setProteinGoal] = useState(120);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [currentProtein, setCurrentProtein] = useState(0);
  const [currentWater, setCurrentWater] = useState(0);
  // ... other state and functions are unchanged

  // --- NEW: Safe percentage calculation ---
  const proteinPercentage = proteinGoal > 0 ? (currentProtein / proteinGoal) * 100 : 0;
  const waterPercentage = waterGoal > 0 ? (currentWater / waterGoal) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ... header is unchanged ... */}

      <div className="p-4 space-y-6 pb-24">
        {/* Nutrition Tracker Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Protein Tracker */}
          <div className="bg-card rounded-lg p-6 border border-border">
            {/* ... card header and target/current displays are unchanged ... */}
            
            <div className="w-full bg-card-elevated rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-primary-accent to-red-400 h-3 rounded-full transition-all duration-300" 
                // --- FIX: Using the safe percentage variable ---
                style={{width: `${Math.min(proteinPercentage, 100)}%`}}
              ></div>
            </div>
            
            {/* ... buttons and other JSX are unchanged ... */}
          </div>

          {/* Hydration Tracker */}
          <div className="bg-card rounded-lg p-6 border border-border">
            {/* ... card header and target/current displays are unchanged ... */}
            
            <div className="w-full bg-card-elevated rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300" 
                // --- FIX: Using the safe percentage variable ---
                style={{width: `${Math.min(waterPercentage, 100)}%`}}
              ></div>
            </div>
            
            {/* ... buttons and other JSX are unchanged ... */}
          </div>
        </div>

        {/* ... rest of the supplements JSX is unchanged ... */}
      </div>
    </div>
  );
}
