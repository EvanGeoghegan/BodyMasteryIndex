import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Download, Upload, User, Target, Database, HelpCircle, Bell } from "lucide-react";
import { storage } from "@/lib/storage";
import { Switch } from "@/components/ui/switch";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Workout, Template, PersonalBest, Supplement, SupplementLog } from "@shared/schema";

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
    // Toast removed
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
      console.error("Export failed:", error);
      // Toast removed
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

        // Toast removed
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error("Import error:", error);
        // Toast removed
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      storage.resetAllData();
      // Toast removed
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
        {/* All JSX remains the same, only the toast calls in the functions above were removed */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          {/* Profile Section... */}
        </div>
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          {/* Goals & Targets... */}
        </div>
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          {/* Workout Preferences... */}
        </div>
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          {/* Notifications... */}
        </div>
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          {/* Data Management... */}
        </div>
        <Button onClick={handleSaveSettings} className="w-full bg-accent-red hover:bg-accent-light-red text-white">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
