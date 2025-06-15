import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Download, User, Target, Database, HelpCircle } from "lucide-react";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  onShowTutorial?: () => void;
}

export default function Settings({ onShowTutorial }: SettingsProps) {
  const [proteinGoal, setProteinGoal] = useState("120");
  const [waterGoal, setWaterGoal] = useState("3.0");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [restTimerDefault, setRestTimerDefault] = useState("150");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [assessmentExercise1, setAssessmentExercise1] = useState("Push-ups");
  const [assessmentExercise2, setAssessmentExercise2] = useState("Pull-ups");
  const { toast } = useToast();

  // Load settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('trainlog_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setProteinGoal(settings.proteinGoal?.toString() || "120");
        setWaterGoal(settings.waterGoal?.toString() || "3.0");
        setWeightUnit(settings.weightUnit || "kg");
        setRestTimerDefault(settings.restTimerDefault?.toString() || "150");
        setCurrentWeight(settings.currentWeight?.toString() || "");
        setTargetWeight(settings.targetWeight?.toString() || "");
        setAssessmentExercise1(settings.assessmentExercise1 || "Push-ups");
        setAssessmentExercise2(settings.assessmentExercise2 || "Pull-ups");
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    // Save settings to localStorage with consistent key
    localStorage.setItem('trainlog_settings', JSON.stringify({
      proteinGoal: parseFloat(proteinGoal),
      waterGoal: parseFloat(waterGoal),
      weightUnit,
      restTimerDefault: parseInt(restTimerDefault),
      currentWeight: currentWeight ? parseFloat(currentWeight) : null,
      targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      assessmentExercise1,
      assessmentExercise2
    }));

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully."
    });
  };

  const handleExportData = () => {
    try {
      const data = {
        workouts: storage.getWorkouts(),
        templates: storage.getTemplates(),
        personalBests: storage.getPersonalBests(),
        supplements: storage.getSupplements(),
        supplementLogs: storage.getSupplementLogs(),
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `body-mastery-index-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded as a backup file."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      storage.resetAllData();
      toast({
        title: "Data cleared",
        description: "All your data has been removed."
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      <header className="bg-dark-secondary border-b border-dark-border">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-text-primary font-['Montserrat']">
            Settings
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your goals, preferences, and data
          </p>
        </div>
      </header>

      <div className="p-4 space-y-6 pb-24">
        {/* Profile Section */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Profile
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-weight" className="text-text-secondary">Current Weight</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="current-weight"
                    type="number"
                    step="0.1"
                    placeholder="70.0"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="bg-dark-elevated border-dark-border text-text-primary"
                  />
                  <span className="text-text-secondary self-center text-sm">{weightUnit}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="target-weight" className="text-text-secondary">Target Weight</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="target-weight"
                    type="number"
                    step="0.1"
                    placeholder="75.0"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="bg-dark-elevated border-dark-border text-text-primary"
                  />
                  <span className="text-text-secondary self-center text-sm">{weightUnit}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Assessment Exercises</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exercise1" className="text-text-secondary">Exercise 1</Label>
                  <Input
                    id="exercise1"
                    type="text"
                    value={assessmentExercise1}
                    onChange={(e) => setAssessmentExercise1(e.target.value)}
                    className="mt-1 bg-dark-elevated border-dark-border text-text-primary"
                  />
                </div>
                
                <div>
                  <Label htmlFor="exercise2" className="text-text-secondary">Exercise 2</Label>
                  <Input
                    id="exercise2"
                    type="text"
                    value={assessmentExercise2}
                    onChange={(e) => setAssessmentExercise2(e.target.value)}
                    className="mt-1 bg-dark-elevated border-dark-border text-text-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals & Targets */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Goals & Targets
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="protein-goal" className="text-text-secondary">Daily Protein Goal</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="protein-goal"
                    type="number"
                    value={proteinGoal}
                    onChange={(e) => setProteinGoal(e.target.value)}
                    className="bg-dark-elevated border-dark-border text-text-primary"
                  />
                  <span className="text-text-secondary self-center text-sm">g</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="water-goal" className="text-text-secondary">Daily Water Goal</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="water-goal"
                    type="number"
                    step="0.1"
                    value={waterGoal}
                    onChange={(e) => setWaterGoal(e.target.value)}
                    className="bg-dark-elevated border-dark-border text-text-primary"
                  />
                  <span className="text-text-secondary self-center text-sm">L</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Preferences */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Workout Preferences
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight-unit" className="text-text-secondary">Weight Unit</Label>
                <Select value={weightUnit} onValueChange={setWeightUnit}>
                  <SelectTrigger className="mt-1 bg-dark-elevated border-dark-border text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rest-timer" className="text-text-secondary">Default Rest Timer</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="rest-timer"
                    type="number"
                    value={restTimerDefault}
                    onChange={(e) => setRestTimerDefault(e.target.value)}
                    className="bg-dark-elevated border-dark-border text-text-primary"
                  />
                  <span className="text-text-secondary self-center text-sm">sec</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <Database className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Data Management
            </h2>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={onShowTutorial}
              variant="outline"
              className="w-full bg-dark-elevated border-dark-border text-text-primary hover:bg-accent-red/20 hover:text-accent-red"
            >
              <HelpCircle className="mr-2" size={16} />
              Show Tutorial
            </Button>
            
            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full bg-dark-elevated border-dark-border text-text-primary hover:bg-accent-green/20 hover:text-accent-green"
            >
              <Download className="mr-2" size={16} />
              Export All Data
            </Button>
            
            <Button
              onClick={handleClearAllData}
              variant="outline"
              className="w-full bg-dark-elevated border-dark-border text-text-primary hover:bg-accent-red/20 hover:text-accent-red"
            >
              <Trash2 className="mr-2" size={16} />
              Clear All Data
            </Button>
          </div>
        </div>

        {/* Save Settings */}
        <Button
          onClick={handleSaveSettings}
          className="w-full bg-accent-red hover:bg-accent-light-red text-white"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}