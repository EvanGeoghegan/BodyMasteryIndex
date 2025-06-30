import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Download, Upload, User, Target, Database, HelpCircle, Bell } from "lucide-react";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Workout, Template, PersonalBest, Supplement, SupplementLog } from "@shared/schema";

// The component no longer needs theme-related props
interface SettingsProps {}

export default function Settings({}: SettingsProps) {
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

  // All logic functions are reverted to their last known stable state
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
    toast({ title: "Settings saved" });
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
        url: result.uri,
      });
    } catch (error) {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Are you sure? This will overwrite all existing data.")) {
      if(fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        if (!data.workouts || !data.templates) throw new Error("Invalid backup file format.");
        
        storage.resetAllData();
        (data.workouts as Workout[] || []).forEach(item => storage.createWorkout(item));
        (data.templates as Template[] || []).forEach(item => storage.createTemplate(item));
        (data.personalBests as PersonalBest[] || []).forEach(item => storage.createPersonalBest(item));
        (data.supplements as Supplement[] || []).forEach(item => storage.createSupplement(item));
        (data.supplementLogs as SupplementLog[] || []).forEach(item => storage.createSupplementLog(item));

        toast({ title: "Import Successful", description: "The app will now reload." });
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        toast({ title: "Import Failed", variant: "destructive" });
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      storage.resetAllData();
      toast({ title: "Data cleared" });
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <div className="bg-dark-primary">
      <header className="bg-dark-secondary border-b border-dark-border p-4">
        <h1 className="text-2xl font-bold text-text-primary font-['Montserrat']">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your goals, preferences, and data</p>
      </header>

      <div className="p-4 space-y-6 pb-24">
        {/* Profile Section */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-weight" className="text-text-secondary">Current Weight</Label>
                <Input id="current-weight" type="number" step="0.1" placeholder="70.0" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
              </div>
              <div>
                <Label htmlFor="target-weight" className="text-text-secondary">Target Weight</Label>
                <Input id="target-weight" type="number" step="0.1" placeholder="75.0" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Assessment Exercises</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exercise1" className="text-text-secondary">Exercise 1</Label>
                  <Input id="exercise1" type="text" value={assessmentExercise1} onChange={(e) => setAssessmentExercise1(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
                </div>
                <div>
                  <Label htmlFor="exercise2" className="text-text-secondary">Exercise 2</Label>
                  <Input id="exercise2" type="text" value={assessmentExercise2} onChange={(e) => setAssessmentExercise2(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals & Targets */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Goals & Targets</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="protein-goal" className="text-text-secondary">Daily Protein Goal</Label>
                <Input id="protein-goal" type="number" value={proteinGoal} onChange={(e) => setProteinGoal(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
              </div>
              <div>
                <Label htmlFor="water-goal" className="text-text-secondary">Daily Water Goal</Label>
                <Input id="water-goal" type="number" step="0.1" value={waterGoal} onChange={(e) => setWaterGoal(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Workout Preferences */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Workout Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="weight-unit" className="text-text-secondary">Weight Unit</Label>
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger className="mt-1 bg-dark-elevated border-dark-border text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-secondary border-dark-border">
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Notifications</h2>
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
                  <Input id="workout-time" type="time" value={workoutReminderTime} onChange={(e) => setWorkoutReminderTime(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-3 border-t border-dark-border pt-4">
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
                  <Input id="nutrition-time" type="time" value={nutritionReminderTime} onChange={(e) => setNutritionReminderTime(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <Database className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Data Management</h2>
          </div>
          <div className="space-y-3">
            <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
            <Button onClick={handleImportClick} variant="outline" className="w-full bg-dark-elevated border-dark-border text-text-primary hover:bg-dark-border">
              <Upload className="mr-2" size={16} /> Import Data from Backup
            </Button>
            <Button onClick={handleExportData} variant="outline" className="w-full bg-dark-elevated border-dark-border text-text-primary hover:bg-dark-border">
              <Download className="mr-2" size={16} /> Export All Data
            </Button>
            <Button onClick={handleClearAllData} variant="outline" className="w-full bg-dark-elevated border-dark-border text-text-primary hover:bg-dark-border hover:text-accent-red">
              <Trash2 className="mr-2" size={16} /> Clear All Data
            </Button>
          </div>
        </div>

        {/* Save Settings */}
        <Button onClick={handleSaveSettings} className="w-full bg-accent-red hover:bg-accent-light-red text-white">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
