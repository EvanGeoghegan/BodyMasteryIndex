import { useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Body Mastery Index</h1>
        <p>Current tab: {activeTab}</p>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("workout")}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Workout
          </button>
        </div>
        
        {activeTab === "dashboard" && (
          <div className="mt-4 p-4 border rounded">
            <h2 className="text-xl">Dashboard</h2>
            <p>Welcome to your fitness tracking dashboard!</p>
          </div>
        )}
        
        {activeTab === "workout" && (
          <div className="mt-4 p-4 border rounded">
            <h2 className="text-xl">Workout</h2>
            <p>Start your workout here!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;