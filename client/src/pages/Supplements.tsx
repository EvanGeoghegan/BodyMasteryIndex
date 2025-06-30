import { useState, useEffect } from "react";
import { Plus, Pill, Clock, Trash2, Edit, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSupplementSchema, type Supplement, type SupplementLog, type InsertSupplement } from "@shared/schema";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

// Unchanged constants
const supplementTypes = [ { value: "vitamin", label: "Vitamin" }, { value: "mineral", label: "Mineral" }, { value: "protein", label: "Protein" }, { value: "creatine", label: "Creatine" }, { value: "pre_workout", label: "Pre-Workout" }, { value: "bcaa", label: "BCAA" }, { value: "omega3", label: "Omega-3" }, { value: "probiotic", label: "Probiotic" }, { value: "other", label: "Other" } ];
const units = [ { value: "mg", label: "mg" }, { value: "g", label: "g" }, { value: "mcg", label: "mcg" }, { value: "iu", label: "IU" }, { value: "ml", label: "ml" }, { value: "tablets", label: "Tablets" }, { value: "capsules", label: "Capsules" }, { value: "scoops", label: "Scoops" } ];
const frequencies = [ { value: "daily", label: "Daily" }, { value: "twice_daily", label: "Twice Daily" }, { value: "three_times_daily", label: "Three Times Daily" }, { value: "weekly", label: "Weekly" }, { value: "as_needed", label: "As Needed" } ];
const timingPreferences = [ { value: "morning", label: "Morning" }, { value: "afternoon", label: "Afternoon" }, { value: "evening", label: "Evening" }, { value: "pre_workout", label: "Pre-Workout" }, { value: "post_workout", label: "Post-Workout" }, { value: "with_meals", label: "With Meals" }, { value: "empty_stomach", label: "Empty Stomach" } ];


export default function Supplements() {
  const [supplements, setSupplements] = useState<Supplement[]>(storage.getSupplements());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayLogs, setTodayLogs] = useState<SupplementLog[]>(storage.getSupplementLogs(selectedDate));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [proteinGoal, setProteinGoal] = useState(120);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [currentProtein, setCurrentProtein] = useState(0);
  const [currentWater, setCurrentWater] = useState(0);
  const [customProteinAmount, setCustomProteinAmount] = useState("");
  const [customWaterAmount, setCustomWaterAmount] = useState("");
  const [lastProteinAction, setLastProteinAction] = useState<number>(0);
  const [lastWaterAction, setLastWaterAction] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    // This logic is correct and remains
  }, []);

  const proteinPercentage = proteinGoal > 0 ? (currentProtein / proteinGoal) * 100 : 0;
  const waterPercentage = waterGoal > 0 ? (currentWater / waterGoal) * 100 : 0;

  // All other functions remain the same
  const saveNutritionData = (protein: number, water: number) => { /* ... */ };
  const addProtein = (amount: number) => { /* ... */ };
  const addWater = (amount: number) => { /* ... */ };
  const undoProtein = () => { /* ... */ };
  const undoWater = () => { /* ... */ };
  const handleCustomProtein = () => { /* ... */ };
  const handleCustomWater = () => { /* ... */ };
  
  const form = useForm<InsertSupplement>({
    resolver: zodResolver(insertSupplementSchema),
    defaultValues: { name: "", brand: "", type: "vitamin", dosage: 0, unit: "mg", frequency: "daily", timingPreference: "morning", notes: "" }
  });

  // All other handlers remain the same
  const refreshData = () => { /* ... */ };
  const onSubmit = (data: InsertSupplement) => { /* ... */ };
  const handleEdit = (supplement: Supplement) => { /* ... */ };
  const handleDelete = (supplement: Supplement) => { /* ... */ };
  const toggleSupplementLog = (supplement: Supplement) => { /* ... */ };
  const getSupplementStatus = (supplement: Supplement) => { /* ... */ };
  const getCompletionRate = () => { /* ... */ };

  return (
    // --- UPDATED JSX with correct theme-aware classes ---
    <div className="bg-background">
      <header className="bg-card border-b border-border p-4">
        <h1 className="text-2xl font-bold text-text-primary font-['Montserrat']">
          Nutrition Log
        </h1>
        <p className="text-text-secondary mt-1">
          Track your daily supplements, protein, and hydration
        </p>
      </header>

      <div className="p-4 space-y-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Protein Tracker */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Daily Protein</h2>
              <div className="text-sm text-text-secondary">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-card-elevated rounded-lg p-4 border border-border text-center">
                <div className="text-2xl font-bold text-primary-accent">{proteinGoal}g</div>
                <div className="text-xs text-text-secondary">Target</div>
              </div>
              <div className="bg-card-elevated rounded-lg p-4 border border-border text-center">
                <div className="text-2xl font-bold text-green-500">{currentProtein}g</div>
                <div className="text-xs text-text-secondary">Current</div>
              </div>
            </div>
            <div className="w-full bg-card-elevated rounded-full h-3 mb-4">
              <div className="bg-primary-accent h-3 rounded-full transition-all duration-300" style={{width: `${Math.min(proteinPercentage, 100)}%`}}></div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addProtein(25)} className="flex-1 bg-card-elevated border-border text-text-secondary hover:bg-border"> +25g </Button>
                <Button variant="outline" size="sm" onClick={() => addProtein(50)} className="flex-1 bg-card-elevated border-border text-text-secondary hover:bg-border"> +50g </Button>
              </div>
              <div className="flex gap-2">
                <Input type="number" placeholder="Custom amount" value={customProteinAmount} onChange={(e) => setCustomProteinAmount(e.target.value)} className="flex-1 bg-card-elevated border-border text-text-primary text-sm" />
                <Button variant="outline" size="sm" onClick={handleCustomProtein} className="bg-card-elevated border-border text-text-secondary hover:bg-border"> Add </Button>
              </div>
              {lastProteinAction > 0 && <Button variant="outline" size="sm" onClick={undoProtein} className="w-full bg-card-elevated border-border text-text-secondary hover:bg-red-500/10 hover:text-red-500"> Undo (-{lastProteinAction}g) </Button>}
            </div>
          </div>

          {/* Hydration Tracker */}
          <div className="bg-card rounded-xl p-6 border border-border">
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Daily Water</h2>
              <div className="text-sm text-text-secondary">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-card-elevated rounded-lg p-4 border border-border text-center">
                <div className="text-2xl font-bold text-blue-500">{waterGoal}L</div>
                <div className="text-xs text-text-secondary">Target</div>
              </div>
              <div className="bg-card-elevated rounded-lg p-4 border border-border text-center">
                <div className="text-2xl font-bold text-green-500">{currentWater}L</div>
                <div className="text-xs text-text-secondary">Current</div>
              </div>
            </div>
            <div className="w-full bg-card-elevated rounded-full h-3 mb-4">
              <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" style={{width: `${Math.min(waterPercentage, 100)}%`}}></div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => addWater(0.25)} className="flex-1 bg-card-elevated border-border text-text-secondary hover:bg-border"> +0.25L </Button>
                  <Button variant="outline" size="sm" onClick={() => addWater(0.5)} className="flex-1 bg-card-elevated border-border text-text-secondary hover:bg-border"> +0.5L </Button>
              </div>
              <div className="flex gap-2">
                <Input type="number" step="0.1" placeholder="Custom amount" value={customWaterAmount} onChange={(e) => setCustomWaterAmount(e.target.value)} className="flex-1 bg-card-elevated border-border text-text-primary text-sm" />
                <Button variant="outline" size="sm" onClick={handleCustomWater} className="bg-card-elevated border-border text-text-secondary hover:bg-border"> Add </Button>
              </div>
              {lastWaterAction > 0 && <Button variant="outline" size="sm" onClick={undoWater} className="w-full bg-card-elevated border-border text-text-secondary hover:bg-red-500/10 hover:text-red-500"> Undo (-{lastWaterAction}L) </Button>}
            </div>
          </div>
        </div>
        
        {/* All other sections of this page remain the same */}
        
      </div>
    </div>
  );
}
