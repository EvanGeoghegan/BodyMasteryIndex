import React, { useState, useEffect, useRef } from "react"; // Import React
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Download, Upload, User, Target, Database, HelpCircle, Bell, Moon, Sun } from "lucide-react";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Workout, Template, PersonalBest, Supplement, SupplementLog } from "@shared/schema";

// --- PROPS INTERFACE ---
interface SettingsProps {
  theme: string;
  onToggleTheme: () => void;
}

// --- UPDATED COMPONENT DEFINITION ---
// We now explicitly define this as a React Functional Component (FC)
// that accepts SettingsProps. This makes the types clearer.
const Settings: React.FC<SettingsProps> = ({ theme, onToggleTheme }) => {
  const [proteinGoal, setProteinGoal] = useState("120");
  const [waterGoal, setWaterGoal] = useState("3.0");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [assessmentExercise1, setAssessmentExercise1] = useState("Push-ups");
  const [assessmentExercise2, setAssessmentExercise2] = useState("Pull-ups");
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [workoutReminderTime, setWorkoutReminderTime] = useState("18:00");
  const [nutritionReminder, setNutritionReminder] = useState(true);
  const [nutritionReminderTime, setNutritionReminderTime] = useState("20:00");
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('bmi_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setProteinGoal(settings.proteinGoal?.toString() || "120");
        setWaterGoal(settings.waterGoal?.toString() || "3.0");
        setWeightUnit(settings.weightUnit || "kg");
        setCurrentWeight(settings.currentWeight?.toString() || "");
        setTargetWeight(settings.targetWeight?.toString() || "");
        setAssessmentExercise1(settings.assessmentExercise1 || "Push-ups");
        setAssessmentExercise2(settings.assessmentExercise2 || "Pull-ups");
        setWorkoutReminder(settings.workoutReminder !== false);
        setWorkoutReminderTime(settings.workoutReminderTime || "18:00");
        setNutritionReminder(settings.nutritionReminder !== false);
        setNutritionReminderTime(settings.nutritionReminderTime || "20:00");
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('bmi_settings', JSON.stringify({
      proteinGoal: parseFloat(proteinGoal),
      waterGoal: parseFloat(waterGoal),
      weightUnit,
      currentWeight: currentWeight ? parseFloat(currentWeight) : null,
      targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      assessmentExercise1,
      assessmentExercise2,
      workoutReminder,
      workoutReminderTime,
      nutritionReminder,
      nutritionReminderTime
    }));

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully."
    });
  };

  const handleExportData = async () => {
    try {
      const dataToExport = {
        workouts: storage.getWorkouts(),
        templates: storage.getTemplates(),
        personalBests: storage.getPersonalBests(),
        supplements: storage.getSupplements(),
        supplementLogs: storage.getSupplementLogs(),
        exportDate: new Date().toISOString()
      };

      const fileName = `body-mastery-index-backup-${new Date().toISOString().split('T')[0]}.json`;
      const dataString = JSON.stringify(dataToExport, null, 2);

      const result = await Filesystem.writeFile({
        path: fileName,
        data: dataString,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: 'Body Mastery Index Backup',
        text: `Here is your app data backup from ${new Date().toLocaleDateString()}.`,
        url: result.uri,
        dialogTitle: 'Share or Save Your Backup',
      });

    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Could not share the backup file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Are you sure you want to import this file? This will overwrite ALL existing data.")) {
      if(fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read");
        
        const data = JSON.parse(text);

        if (!data.workouts || !data.templates) {
            throw new Error("Invalid backup file format.");
        }
        
        storage.resetAllData();
        (data.workouts as Workout[] || []).forEach(item => storage.createWorkout(item));
        (data.templates as Template[] || []).forEach(item => storage.createTemplate(item));
        (data.personalBests as PersonalBest[] || []).forEach(item => storage.createPersonalBest(item));
        (data.supplements as Supplement[] || []).forEach(item => storage.createSupplement(item));
        (data.supplementLogs as SupplementLog[] || []).forEach(item => storage.createSupplementLog(item));

        toast({
          title: "Import Successful",
          description: "Your data has been restored. The app will now reload.",
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import Failed",
          description: (error as Error).message || "The selected file is not a valid backup.",
          variant: "destructive",
        });
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };


  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      storage.resetAllData();
      toast({
        title: "Data cleared",
        description: "All your data has been removed."
      });
      setTimeout(() => {
          window.location.reload();
        }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
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
        {/* --- NEW THEME TOGGLE SECTION --- */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-lg font-semibold text-text-primary font-['Montserrat'] mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode-switch" className="flex items-center gap-2 text-text-primary">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <span>Dark Mode</span>
            </Label>
            <Switch
              id="dark-mode-switch"
              checked={theme === 'dark'}
              onCheckedChange={onToggleTheme}
            />
          </div>
        </div>
        {/* --- END NEW SECTION --- */}

        {/* Profile Section */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-primary-accent" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Profile
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-weight" className="text-text-secondary">Current Weight</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="current-weight" type="number" step="0.1" placeholder="70.0" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="bg-card-elevated border-border text-text-primary" />
                  <span className="text-text-secondary self-center text-sm">{weightUnit}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="target-weight" className="text-text-secondary">Target Weight</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="target-weight" type="number" step="0.1" placeholder="75.0" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="bg-card-elevated border-border text-text-primary" />
                  <span className="text-text-secondary self-center text-sm">{weightUnit}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Assessment Exercises</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exercise1" className="text-text-secondary">Exercise 1</Label>
                  <Input id="exercise1" type="text" value={assessmentExercise1} onChange={(e) => setAssessmentExercise1(e.target.value)} className="mt-1 bg-card-elevated border-border text-text-primary" />
                </div>
                <div>
                  <Label htmlFor="exercise2" className="text-text-secondary">Exercise 2</Label>
                  <Input id="exercise2" type="text" value={assessmentExercise2} onChange={(e) => setAssessmentExercise2(e.target.value)} className="mt-1 bg-card-elevated border-border text-text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals & Targets */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-primary-accent" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Goals & Targets
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="protein-goal" className="text-text-secondary">Daily Protein Goal</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="protein-goal" type="number" value={proteinGoal} onChange={(e) => setProteinGoal(e.target.value)} className="bg-card-elevated border-border text-text-primary" />
                  <span className="text-text-secondary self-center text-sm">g</span>
                </div>
              </div>
              <div>
                <Label htmlFor="water-goal" className="text-text-secondary">Daily Water Goal</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="water-goal" type="number" step="0.1" value={waterGoal} onChange={(e) => setWaterGoal(e.target.value)} className="bg-card-elevated border-border text-text-primary" />
                  <span className="text-text-secondary self-center text-sm">L</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Preferences */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-primary-accent" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Workout Preferences
            </h2>
          </div>
          <div className="space-y-4">
            <div>
                <Label htmlFor="weight-unit" className="text-text-secondary">Weight Unit</Label>
                <Select value={weightUnit} onValueChange={setWeightUnit}>
                  <SelectTrigger className="mt-1 bg-card-elevated border-border text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-primary-accent" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Notifications
            </h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text-primary font-medium">Workout Reminders</Label>
                  <p className="text-xs text-text-secondary mt-1">Get reminded to log your workouts</p>
                </div>
                <Switch checked={workoutReminder} onCheckedChange={setWorkoutReminder} />
              </div>
              {workoutReminder && (
                <div>
                  <Label htmlFor="workout-time" className="text-text-secondary">Reminder Time</Label>
                  <Input id="workout-time" type="time" value={workoutReminderTime} onChange={(e) => setWorkoutReminderTime(e.target.value)} className="mt-1 bg-card-elevated border-border text-text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-text-primary font-medium">Nutrition Reminders</Label>
                  <p className="text-xs text-text-secondary mt-1">Get reminded to log protein and water</p>
                </div>
                <Switch checked={nutritionReminder} onCheckedChange={setNutritionReminder} />
              </div>
              {nutritionReminder && (
                <div>
                  <Label htmlFor="nutrition-time" className="text-text-secondary">Reminder Time</Label>
                  <Input id="nutrition-time" type="time" value={nutritionReminderTime} onChange={(e) => setNutritionReminderTime(e.target.value)} className="mt-1 bg-card-elevated border-border text-text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Database className="text-primary-accent" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Data Management
            </h2>
          </div>
          <div className="space-y-3">
            <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
            <Button onClick={handleImportClick} variant="outline" className="w-full bg-card-elevated border-border text-text-primary hover:bg-secondary-accent/20 hover:text-secondary-accent">
              <Upload className="mr-2" size={16} /> Import Data from Backup
            </Button>
            <Button onClick={handleExportData} variant="outline" className="w-full bg-card-elevated border-border text-text-primary hover:bg-success-accent/20 hover:text-success-accent">
              <Download className="mr-2" size={16} /> Export All Data
            </Button>
            <Button onClick={handleClearAllData} variant="outline" className="w-full bg-card-elevated border-border text-text-primary hover:bg-primary-accent/20 hover:text-primary-accent">
              <Trash2 className="mr-2" size={16} /> Clear All Data
            </Button>
          </div>
        </div>

        {/* Save Settings */}
        <Button onClick={handleSaveSettings} className="w-full bg-primary-accent hover:opacity-90 text-white">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
