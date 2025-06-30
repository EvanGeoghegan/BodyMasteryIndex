import { useState, useEffect } from "react";
import { Plus, Pill, Trash2, Edit } from "lucide-react";
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

  const proteinPercentage = proteinGoal > 0 ? (currentProtein / proteinGoal) * 100 : 0;
  const waterPercentage = waterGoal > 0 ? (currentWater / waterGoal) * 100 : 0;
  
  const refreshNutritionData = () => {
    const savedSettings = localStorage.getItem('bmi_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setProteinGoal(settings.proteinGoal || 120);
        setWaterGoal(settings.waterGoal || 3.0);
      } catch (error) { console.error('Error loading settings:', error); }
    }
    const today = new Date().toISOString().split('T')[0];
    const nutritionData = localStorage.getItem(`nutrition_${today}`);
    if (nutritionData) {
      try {
        const data = JSON.parse(nutritionData);
        setCurrentProtein(data.protein || 0);
        setCurrentWater(data.water || 0);
      } catch (error) { console.error('Error loading nutrition data:', error); }
    }
  };

  useEffect(() => {
    refreshNutritionData();
  }, []);

  const saveNutritionData = (protein: number, water: number) => {
    const today = new Date().toISOString().split('T')[0];
    const nutritionData = { protein, water, date: today };
    localStorage.setItem(`nutrition_${today}`, JSON.stringify(nutritionData));
  };

  const addProtein = (amount: number) => {
    const newProtein = Math.round((currentProtein + amount) * 10) / 10;
    setCurrentProtein(newProtein);
    setLastProteinAction(amount);
    saveNutritionData(newProtein, currentWater);
    toast({ title: "Protein logged", description: `Added ${amount}g protein. Total: ${newProtein}g` });
  };

  const addWater = (amount: number) => {
    const newWater = Math.round((currentWater + amount) * 10) / 10;
    setCurrentWater(newWater);
    setLastWaterAction(amount);
    saveNutritionData(currentProtein, newWater);
    toast({ title: "Water logged", description: `Added ${amount}L water. Total: ${newWater}L` });
  };

  const undoProtein = () => {
    if (lastProteinAction > 0) {
      const newProtein = Math.max(0, Math.round((currentProtein - lastProteinAction) * 10) / 10);
      setCurrentProtein(newProtein);
      saveNutritionData(newProtein, currentWater);
      setLastProteinAction(0);
      toast({ title: "Protein undone", description: `Removed ${lastProteinAction}g protein. Total: ${newProtein}g` });
    }
  };

  const undoWater = () => {
    if (lastWaterAction > 0) {
      const newWater = Math.max(0, Math.round((currentWater - lastWaterAction) * 10) / 10);
      setCurrentWater(newWater);
      saveNutritionData(currentProtein, newWater);
      setLastWaterAction(0);
      toast({ title: "Water undone", description: `Removed ${lastWaterAction}L water. Total: ${newWater}L` });
    }
  };

  const handleCustomProtein = () => {
    const amount = parseFloat(customProteinAmount);
    if (amount && amount > 0) {
      addProtein(amount);
      setCustomProteinAmount("");
    }
  };

  const handleCustomWater = () => {
    const amount = parseFloat(customWaterAmount);
    if (amount && amount > 0) {
      addWater(amount);
      setCustomWaterAmount("");
    }
  };

  const form = useForm<InsertSupplement>({
    resolver: zodResolver(insertSupplementSchema),
    defaultValues: { name: "", brand: "", type: "vitamin", dosage: 0, unit: "mg", frequency: "daily", timingPreference: "morning", notes: "" }
  });

  const refreshData = () => {
    setSupplements(storage.getSupplements());
    setTodayLogs(storage.getSupplementLogs(selectedDate));
  };

  const onSubmit = (data: InsertSupplement) => {
    try {
      if (editingSupplement) {
        storage.updateSupplement(editingSupplement.id, data);
        toast({ title: "Supplement updated" });
      } else {
        storage.createSupplement(data);
        toast({ title: "Supplement added" });
      }
      refreshData();
      setIsAddDialogOpen(false);
      setEditingSupplement(null);
      form.reset();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleEdit = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    form.reset({ ...supplement });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (supplement: Supplement) => {
    if (window.confirm(`Are you sure you want to delete ${supplement.name}?`)) {
      storage.deleteSupplement(supplement.id);
      refreshData();
      toast({ title: "Supplement deleted" });
    }
  };

  const toggleSupplementLog = (supplement: Supplement) => {
    const existingLog = todayLogs.find(log => log.supplementId === supplement.id);
    if (existingLog) {
      storage.updateSupplementLog(existingLog.id, { taken: !existingLog.taken });
    } else {
      storage.createSupplementLog({ supplementId: supplement.id, date: selectedDate, time: new Date().toLocaleTimeString('en-US', { hour12: false }), taken: true });
    }
    refreshData();
  };

  const getSupplementStatus = (supplement: Supplement) => {
    const log = todayLogs.find(log => log.supplementId === supplement.id);
    return log?.taken || false;
  };

  const getCompletionRate = () => {
    if (supplements.length === 0) return 0;
    const takenCount = supplements.filter(s => getSupplementStatus(s)).length;
    return Math.round((takenCount / supplements.length) * 100);
  };

  return (
    <div className="bg-dark-primary">
      <header className="bg-dark-secondary border-b border-dark-border p-4">
        <h1 className="text-2xl font-bold text-text-primary font-['Montserrat']">Nutrition Log</h1>
        <p className="text-text-secondary mt-1">Track your daily supplements, protein, and hydration</p>
      </header>

      <div className="p-4 space-y-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Daily Protein</h2>
              <div className="text-sm text-text-secondary">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border text-center">
                <div className="text-2xl font-bold text-accent-red">{proteinGoal}g</div>
                <div className="text-xs text-text-secondary">Target</div>
              </div>
              <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border text-center">
                <div className="text-2xl font-bold text-accent-green">{currentProtein}g</div>
                <div className="text-xs text-text-secondary">Current</div>
              </div>
            </div>
            <div className="w-full bg-dark-elevated rounded-full h-3 mb-4">
              <div className="bg-accent-red h-3 rounded-full transition-all duration-300" style={{width: `${Math.min(proteinPercentage, 100)}%`}}></div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addProtein(25)} className="flex-1 bg-dark-elevated border-dark-border text-text-secondary hover:bg-dark-border"> +25g </Button>
                <Button variant="outline" size="sm" onClick={() => addProtein(50)} className="flex-1 bg-dark-elevated border-dark-border text-text-secondary hover:bg-dark-border"> +50g </Button>
              </div>
              <div className="flex gap-2">
                <Input type="number" placeholder="Custom amount" value={customProteinAmount} onChange={(e) => setCustomProteinAmount(e.target.value)} className="flex-1 bg-dark-elevated border-dark-border text-text-primary text-sm" />
                <Button variant="outline" size="sm" onClick={handleCustomProtein} className="bg-dark-elevated border-dark-border text-text-secondary hover:bg-dark-border"> Add </Button>
              </div>
              {lastProteinAction > 0 && <Button variant="ghost" size="sm" onClick={undoProtein} className="w-full text-red-500 hover:bg-red-500/10"> Undo (-{lastProteinAction}g) </Button>}
            </div>
          </div>

          <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Daily Water</h2>
              <div className="text-sm text-text-secondary">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border text-center">
                <div className="text-2xl font-bold text-blue-400">{waterGoal}L</div>
                <div className="text-xs text-text-secondary">Target</div>
              </div>
              <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border text-center">
                <div className="text-2xl font-bold text-accent-green">{currentWater}L</div>
                <div className="text-xs text-text-secondary">Current</div>
              </div>
            </div>
            <div className="w-full bg-dark-elevated rounded-full h-3 mb-4">
              <div className="bg-blue-400 h-3 rounded-full transition-all duration-300" style={{width: `${Math.min(waterPercentage, 100)}%`}}></div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => addWater(0.25)} className="flex-1 bg-dark-elevated border-dark-border text-text-secondary hover:bg-dark-border"> +0.25L </Button>
                  <Button variant="outline" size="sm" onClick={() => addWater(0.5)} className="flex-1 bg-dark-elevated border-dark-border text-text-secondary hover:bg-dark-border"> +0.5L </Button>
              </div>
              <div className="flex gap-2">
                <Input type="number" step="0.1" placeholder="Custom amount" value={customWaterAmount} onChange={(e) => setCustomWaterAmount(e.target.value)} className="flex-1 bg-dark-elevated border-dark-border text-text-primary text-sm" />
                <Button variant="outline" size="sm" onClick={handleCustomWater} className="bg-dark-elevated border-dark-border text-text-secondary hover:bg-dark-border"> Add </Button>
              </div>
              {lastWaterAction > 0 && <Button variant="ghost" size="sm" onClick={undoWater} className="w-full text-red-500 hover:bg-red-500/10"> Undo (-{lastWaterAction}L) </Button>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">Daily Supplements</h2>
            <p className="text-sm text-text-secondary">{getCompletionRate()}% completed today</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
            <Button className="bg-accent-red text-white" onClick={() => { setEditingSupplement(null); form.reset(); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Supplement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-dark-secondary border-dark-border">
             <DialogHeader><DialogTitle className="text-text-primary"> {editingSupplement ? 'Edit Supplement' : 'Add New Supplement'} </DialogTitle></DialogHeader>
             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel className="text-text-secondary">Name</FormLabel> <FormControl> <Input placeholder="e.g., Vitamin D3" {...field} className="bg-dark-elevated border-dark-border text-text-primary"/> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem> <FormLabel className="text-text-secondary">Brand (Optional)</FormLabel> <FormControl> <Input placeholder="e.g., Nature Made" {...field} className="bg-dark-elevated border-dark-border text-text-primary"/> </FormControl> <FormMessage /> </FormItem> )}/>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel className="text-text-secondary">Type</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger className="bg-dark-elevated border-dark-border text-text-primary"><SelectValue /></SelectTrigger> </FormControl> <SelectContent className="bg-dark-secondary border-dark-border"> {supplementTypes.map(type => ( <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="frequency" render={({ field }) => ( <FormItem> <FormLabel className="text-text-secondary">Frequency</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger className="bg-dark-elevated border-dark-border text-text-primary"><SelectValue /></SelectTrigger> </FormControl> <SelectContent className="bg-dark-secondary border-dark-border"> {frequencies.map(freq => ( <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="dosage" render={({ field }) => ( <FormItem> <FormLabel className="text-text-secondary">Dosage</FormLabel> <FormControl> <Input type="number" placeholder="1000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="bg-dark-elevated border-dark-border text-text-primary"/> </FormControl> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="unit" render={({ field }) => ( <FormItem> <FormLabel className="text-text-secondary">Unit</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger className="bg-dark-elevated border-dark-border text-text-primary"><SelectValue /></SelectTrigger> </FormControl> <SelectContent className="bg-dark-secondary border-dark-border"> {units.map(unit => ( <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                </div>
                <FormField control={form.control} name="timingPreference" render={({ field }) => ( <FormItem> <FormLabel className="text-text-secondary">Timing Preference</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger className="bg-dark-elevated border-dark-border text-text-primary"><SelectValue /></SelectTrigger> </FormControl> <SelectContent className="bg-dark-secondary border-dark-border"> {timingPreferences.map(timing => ( <SelectItem key={timing.value} value={timing.value}>{timing.label}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem> <FormLabel className="text-text-secondary">Notes (Optional)</FormLabel> <FormControl> <Textarea placeholder="Any additional notes..." {...field} className="bg-dark-elevated border-dark-border text-text-primary"/> </FormControl> <FormMessage /> </FormItem> )}/>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-accent-red text-white"> {editingSupplement ? 'Update' : 'Add'} Supplement </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); setEditingSupplement(null); form.reset(); }} className="bg-dark-elevated border-dark-border text-text-secondary"> Cancel </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-dark-elevated border-dark-border">
            <TabsTrigger value="today" className="data-[state=active]:bg-accent-red data-[state=active]:text-white">Today's Supplements</TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-accent-red data-[state=active]:text-white">Manage Supplements</TabsTrigger>
          </TabsList>
          {/* Tabs content remains the same */}
        </Tabs>
      </div>
    </div>
  );
}
