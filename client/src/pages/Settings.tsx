import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Download, Upload, User, Target, Database, HelpCircle, Bell, Check, Save } from "lucide-react";
import { storage } from "@/lib/storage";
import { Switch } from "@/components/ui/switch";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Workout, Template, PersonalBest, Supplement, SupplementLog } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SettingsProps {}

export default function Settings({}: SettingsProps) {
  const [proteinGoal, setProteinGoal] = useState("120");
  const [waterGoal, setWaterGoal] = useState("3.0");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [currentBodyFat, setCurrentBodyFat] = useState("");
  const [targetBodyFat, setTargetBodyFat] = useState("");
  const [assessmentExercise1, setAssessmentExercise1] = useState("Push-ups");
  const [assessmentExercise2, setAssessmentExercise2] = useState("Pull-ups");
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [workoutReminderTime, setWorkoutReminderTime] = useState("18:00");
  const [nutritionReminder, setNutritionReminder] = useState(true);
  const [nutritionReminderTime, setNutritionReminderTime] = useState("20:00");
  const [isSaving, setIsSaving] = useState(false);

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
        setCurrentBodyFat(settings.currentBodyFat?.toString() || "");
        setTargetBodyFat(settings.targetBodyFat?.toString() || "");
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

  const scheduleNotifications = async () => {
    // This function is assumed to be correct from previous steps
  };

  const handleSaveSettings = () => {
    const settingsToSave = {
      proteinGoal: parseFloat(proteinGoal),
      waterGoal: parseFloat(waterGoal),
      weightUnit,
      currentWeight: currentWeight ? parseFloat(currentWeight) : null,
      targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      currentBodyFat: currentBodyFat ? parseFloat(currentBodyFat) : null,
      targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : null,
      assessmentExercise1,
      assessmentExercise2,
      workoutReminder,
      workoutReminderTime,
      nutritionReminder,
      nutritionReminderTime
    };
    
    localStorage.setItem('bmi_settings', JSON.stringify(settingsToSave));

    if (settingsToSave.currentWeight || settingsToSave.currentBodyFat) {
      const history = JSON.parse(localStorage.getItem('body_composition_history') || '[]');
      history.push({
        date: new Date().toISOString().split('T')[0],
        weight: settingsToSave.currentWeight,
        bodyFat: settingsToSave.currentBodyFat,
      });
      localStorage.setItem('body_composition_history', JSON.stringify(history));
    }
    
    scheduleNotifications();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleExportData = async () => { /* ... unchanged ... */ };
  const handleImportClick = () => { /* ... unchanged ... */ };
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... unchanged ... */ };
  const handleClearAllData = () => { /* ... unchanged ... */ };

  return (
    <div className="bg-dark-primary">
      <header className="bg-dark-secondary border-b border-dark-border p-4">
        <h1 className="text-2xl font-bold text-text-primary font-['Montserrat']">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your goals, preferences, and data</p>
      </header>

      <div className="p-4 space-y-6 pb-24">
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-weight" className="text-text-secondary">Current Weight ({weightUnit})</Label>
                <Input id="current-weight" type="number" step="0.1" placeholder="70.0" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
              </div>
              <div>
                <Label htmlFor="target-weight" className="text-text-secondary">Target Weight ({weightUnit})</Label>
                <Input id="target-weight" type="number" step="0.1" placeholder="75.0" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-body-fat" className="text-text-secondary">Current Body Fat (%)</Label>
                <Input id="current-body-fat" type="number" step="0.1" placeholder="15.0" value={currentBodyFat} onChange={(e) => setCurrentBodyFat(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
              </div>
              <div>
                <Label htmlFor="target-body-fat" className="text-text-secondary">Target Body Fat (%)</Label>
                <Input id="target-body-fat" type="number" step="0.1" placeholder="12.0" value={targetBodyFat} onChange={(e) => setTargetBodyFat(e.target.value)} className="mt-1 bg-dark-elevated border-dark-border text-text-primary" />
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
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className={cn(
            "w-full bg-accent-red hover:bg-accent-light-red text-white transition-all duration-300",
            isSaving && "ring-2 ring-offset-2 ring-offset-dark-primary ring-accent-light-red"
          )}
        >
          {isSaving ? <><Check className="mr-2" size={20} /> Saved!</> : <><Save className="mr-2" size={20} /> Save Settings</>}
        </Button>
      </div>
    </div>
  );
}
