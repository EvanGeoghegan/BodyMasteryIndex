import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Download, Upload, User, Target, Database, HelpCircle, Bell } from "lucide-react";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
// Import the necessary Capacitor plugins
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Workout, Template, PersonalBest, Supplement, SupplementLog } from "@shared/schema";


interface SettingsProps {
  onShowTutorial?: () => void; // This prop is no longer used but safe to keep for now
}

export default function Settings({ onShowTutorial }: SettingsProps) {
  const [proteinGoal, setProteinGoal] = useState("120");
  const [waterGoal, setWaterGoal] = useState("3.0");
  const [weightUnit, setWeightUnit] = useState("kg");
  // const [restTimerDefault, setRestTimerDefault] = useState("150"); // REMOVED
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
        // setRestTimerDefault(settings.restTimerDefault?.toString() || "150"); // REMOVED
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
      // restTimerDefault: parseInt(restTimerDefault), // REMOVED
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
        {/* Profile Section (unchanged) */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
            {/* ... JSX for this section is unchanged */}
        </div>
        
        {/* Goals & Targets (unchanged) */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
            {/* ... JSX for this section is unchanged */}
        </div>

        {/* --- MODIFIED Workout Preferences Section --- */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-accent-red" size={20} />
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Workout Preferences
            </h2>
          </div>
          
          <div className="space-y-4">
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
            {/* The Default Rest Timer Input has been removed from here */}
          </div>
        </div>
        {/* --- END MODIFICATION --- */}


        {/* Notifications (unchanged) */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
            {/* ... JSX for this section is unchanged */}
        </div>

        {/* Data Management (unchanged) */}
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
            {/* ... JSX for this section is unchanged */}
        </div>

        {/* Save Settings Button (unchanged) */}
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
