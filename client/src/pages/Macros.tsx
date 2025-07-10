import { useState, useEffect } from "react";
import { Plus, Pill, Calendar, Clock, PieChart, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSupplementSchema, type Supplement, type SupplementLog, type InsertSupplement, type InsertSupplementLog } from "@shared/schema";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const supplementTypes = [
  { value: "vitamin", label: "Vitamin" },
  { value: "mineral", label: "Mineral" },
  { value: "protein", label: "Protein" },
  { value: "creatine", label: "Creatine" },
  { value: "pre_workout", label: "Pre-Workout" },
  { value: "bcaa", label: "BCAA" },
  { value: "omega3", label: "Omega-3" },
  { value: "probiotic", label: "Probiotic" },
  { value: "other", label: "Other" }
];

const units = [
  { value: "mg", label: "mg" },
  { value: "g", label: "g" },
  { value: "mcg", label: "mcg" },
  { value: "iu", label: "IU" },
  { value: "ml", label: "ml" },
  { value: "tablets", label: "Tablets" },
  { value: "capsules", label: "Capsules" },
  { value: "scoops", label: "Scoops" }
];

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "twice_daily", label: "Twice Daily" },
  { value: "three_times_daily", label: "Three Times Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As Needed" }
];

const timingPreferences = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "pre_workout", label: "Pre-Workout" },
  { value: "post_workout", label: "Post-Workout" },
  { value: "with_meals", label: "With Meals" },
  { value: "empty_stomach", label: "Empty Stomach" }
];

export default function Macros() {
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

  // Load settings and daily nutrition data
  useEffect(() => {
    const savedSettings = localStorage.getItem('bmi_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setProteinGoal(settings.proteinGoal || 120);
        setWaterGoal(settings.waterGoal || 3.0);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    // Load today's nutrition data
    const today = new Date().toISOString().split('T')[0];
    const nutritionData = localStorage.getItem(`nutrition_${today}`);
    if (nutritionData) {
      try {
        const data = JSON.parse(nutritionData);
        setCurrentProtein(data.protein || 0);
        setCurrentWater(data.water || 0);
      } catch (error) {
        console.error('Error loading nutrition data:', error);
      }
    }
  }, []);

  // Save nutrition data when it changes
  const saveNutritionData = (protein: number, water: number) => {
    const today = new Date().toISOString().split('T')[0];
    const nutritionData = { protein, water, date: today };
    localStorage.setItem(`nutrition_${today}`, JSON.stringify(nutritionData));
  };

  // Add protein with custom amount
  const addProtein = (amount: number) => {
    const newProtein = Math.round((currentProtein + amount) * 10) / 10;
    setCurrentProtein(newProtein);
    setLastProteinAction(amount);
    saveNutritionData(newProtein, currentWater);
    // toast({ title: "Protein logged", description: `Added ${amount}g protein. Total: ${newProtein}g` }); // REMOVED
  };

  // Add water with custom amount  
  const addWater = (amount: number) => {
    const newWater = Math.round((currentWater + amount) * 10) / 10;
    setCurrentWater(newWater);
    setLastWaterAction(amount);
    saveNutritionData(currentProtein, newWater);
    // toast({ title: "Water logged", description: `Added ${amount}L water. Total: ${newWater}L` }); // REMOVED
  };

  // Undo last protein action
  const undoProtein = () => {
    if (lastProteinAction > 0) {
      const newProtein = Math.max(0, Math.round((currentProtein - lastProteinAction) * 10) / 10);
      setCurrentProtein(newProtein);
      saveNutritionData(newProtein, currentWater);
      setLastProteinAction(0);
      // toast({ title: "Protein undone", description: `Removed ${lastProteinAction}g protein. Total: ${newProtein}g` }); // REMOVED
    }
  };

  // Undo last water action
  const undoWater = () => {
    if (lastWaterAction > 0) {
      const newWater = Math.max(0, Math.round((currentWater - lastWaterAction) * 10) / 10);
      setCurrentWater(newWater);
      saveNutritionData(currentProtein, newWater);
      setLastWaterAction(0);
      // toast({ title: "Water undone", description: `Removed ${lastWaterAction}L water. Total: ${newWater}L` }); // REMOVED
    }
  };

  // Handle custom protein logging
  const handleCustomProtein = () => {
    const amount = parseFloat(customProteinAmount);
    if (amount && amount > 0) {
      addProtein(amount);
      setCustomProteinAmount("");
    }
  };

  // Handle custom water logging
  const handleCustomWater = () => {
    const amount = parseFloat(customWaterAmount);
    if (amount && amount > 0) {
      addWater(amount);
      setCustomWaterAmount("");
    }
  };

  const form = useForm<InsertSupplement>({
    resolver: zodResolver(insertSupplementSchema),
    defaultValues: {
      name: "",
      brand: "",
      type: "vitamin",
      dosage: 0,
      unit: "mg",
      frequency: "daily",
      timingPreference: "morning",
      notes: ""
    }
  });

  const refreshData = () => {
    setSupplements(storage.getSupplements());
    setTodayLogs(storage.getSupplementLogs(selectedDate));
  };

  const onSubmit = (data: InsertSupplement) => {
    try {
      if (editingSupplement) {
        storage.updateSupplement(editingSupplement.id, data);
        // toast({ title: "Supplement updated", description: `${data.name} has been updated successfully.` }); // REMOVED
      } else {
        storage.createSupplement(data);
        // toast({ title: "Supplement added", description: `${data.name} has been added to your list.` }); // REMOVED
      }

      refreshData();
      setIsAddDialogOpen(false);
      setEditingSupplement(null);
      form.reset();
    } catch (error) {
      // toast({ title: "Error", description: "Failed to save supplement. Please try again.", variant: "destructive" }); // REMOVED
    }
  };

  const handleEdit = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    form.reset({
      name: supplement.name,
      brand: supplement.brand || "",
      type: supplement.type,
      dosage: supplement.dosage,
      unit: supplement.unit,
      frequency: supplement.frequency,
      timingPreference: supplement.timingPreference || "morning",
      notes: supplement.notes || ""
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (supplement: Supplement) => {
    if (window.confirm(`Are you sure you want to delete ${supplement.name}?`)) {
      storage.deleteSupplement(supplement.id);
      refreshData();
      // toast({ title: "Supplement deleted", description: `${supplement.name} has been removed.` }); // REMOVED
    }
  };

  const toggleSupplementLog = (supplement: Supplement) => {
    const existingLog = todayLogs.find(log => log.supplementId === supplement.id);

    if (existingLog) {
      storage.updateSupplementLog(existingLog.id, { taken: !existingLog.taken });
    } else {
      const newLog: InsertSupplementLog = {
        supplementId: supplement.id,
        date: selectedDate,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        taken: true
      };
      storage.createSupplementLog(newLog);
    }

    refreshData();
    // const wasMarkedTaken = !existingLog || !existingLog.taken;
    // toast({ title: wasMarkedTaken ? "Supplement taken" : "Supplement unmarked", description: `${supplement.name} ${wasMarkedTaken ? 'marked as taken' : 'unmarked'} for today.` }); // REMOVED
  };

  const getSupplementStatus = (supplement: Supplement) => {
    const log = todayLogs.find(log => log.supplementId === supplement.id);
    return log?.taken || false;
  };

  const getCompletionRate = () => {
    if (supplements.length === 0) return 0;
    const takenCount = supplements.filter(supplement => getSupplementStatus(supplement)).length;
    return Math.round((takenCount / supplements.length) * 100);
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      <header className="bg-dark-secondary p-2 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left side: Page Icon + Title */}
          <div className="flex items-center">
            <PieChart className="text-accent-red mr-4" size={28} />
            <div>
              <h2 className="text-xl font-bold text-text-primary font-heading">
                Macro Tracker
              </h2>
              <p className="text-text-secondary mt-1">Log your daily macro/micronutrients.</p>
            </div>
          </div>

          {/* Right side: App Logo */}
          <div className="w-14 h-14 bg-dark-elevated rounded-full flex items-center justify-center overflow-hidden border-2 border-dark-border flex-shrink-0">
            <img
              src="/assets/icon.png"
              alt="Body Mastery Index Icon"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 pb-24">
        {/* Nutrition Tracker Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Protein Tracker */}
          <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
                Daily Protein
              </h2>
              <div className="text-sm text-text-secondary">
                {new Date().toLocaleDateString()}
              </div>
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
              <div
                className="bg-gradient-to-r from-accent-red to-accent-light-red h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentProtein / proteinGoal) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addProtein(25)}
                  className="flex-1 bg-dark-elevated border-dark-border text-text-secondary hover:bg-accent-green/20 hover:text-accent-green"
                >
                  +25g
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addProtein(50)}
                  className="flex-1 bg-dark-elevated border-dark-border text-text-secondary hover:bg-accent-green/20 hover:text-accent-green"
                >
                  +50g
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={customProteinAmount}
                  onChange={(e) => setCustomProteinAmount(e.target.value)}
                  className="flex-1 bg-dark-elevated border-dark-border text-text-primary text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomProtein}
                  className="bg-dark-elevated border-dark-border text-text-secondary hover:bg-accent-green/20 hover:text-accent-green"
                >
                  Add
                </Button>
              </div>
              {lastProteinAction > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoProtein}
                  className="w-full bg-dark-elevated border-dark-border text-text-secondary hover:bg-red-500/20 hover:text-red-400"
                >
                  Undo (-{lastProteinAction}g)
                </Button>
              )}
            </div>
          </div>

          {/* Hydration Tracker */}
          <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
                Daily Water
              </h2>
              <div className="text-sm text-text-secondary">
                {new Date().toLocaleDateString()}
              </div>
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
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentWater / waterGoal) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addWater(0.25)}
                  className="flex-1 bg-dark-elevated border-dark-border text-text-secondary hover:bg-blue-500/20 hover:text-blue-400"
                >
                  +0.25L
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addWater(0.5)}
                  className="flex-1 bg-dark-elevated border-dark-border text-text-secondary hover:bg-blue-500/20 hover:text-blue-400"
                >
                  +0.5L
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Custom amount"
                  value={customWaterAmount}
                  onChange={(e) => setCustomWaterAmount(e.target.value)}
                  className="flex-1 bg-dark-elevated border-dark-border text-text-primary text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomWater}
                  className="bg-dark-elevated border-dark-border text-text-secondary hover:bg-blue-500/20 hover:text-blue-400"
                >
                  Add
                </Button>
              </div>
              {lastWaterAction > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoWater}
                  className="w-full bg-dark-elevated border-dark-border text-text-secondary hover:bg-red-500/20 hover:text-red-400"
                >
                  Undo (-{lastWaterAction}L)
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary font-['Montserrat']">
              Daily Supplements
            </h2>
            <p className="text-sm text-text-secondary">
              {getCompletionRate()}% completed today
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-accent-red hover:bg-accent-light-red text-white"
                onClick={() => {
                  setEditingSupplement(null);
                  form.reset();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Supplement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-dark-secondary border-dark-border">
              <DialogHeader>
                <DialogTitle className="text-text-primary font-['Montserrat']">
                  {editingSupplement ? 'Edit Supplement' : 'Add New Supplement'}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Vitamin D3" {...field} className="bg-dark-elevated border-dark-border text-text-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Brand (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Nature Made" {...field} className="bg-dark-elevated border-dark-border text-text-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-dark-elevated border-dark-border text-text-primary"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-dark-secondary border-dark-border">
                              {supplementTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-dark-elevated border-dark-border text-text-primary"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-dark-secondary border-dark-border">
                              {frequencies.map(freq => (
                                <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Dosage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1000"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              className="bg-dark-elevated border-dark-border text-text-primary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-dark-elevated border-dark-border text-text-primary"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-dark-secondary border-dark-border">
                              {units.map(unit => (
                                <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="timingPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Timing Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-dark-elevated border-dark-border text-text-primary"><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-secondary border-dark-border">
                            {timingPreferences.map(timing => (
                              <SelectItem key={timing.value} value={timing.value}>{timing.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional notes..." {...field} className="bg-dark-elevated border-dark-border text-text-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

          <TabsContent value="today" className="space-y-6 mt-6">
            {supplements.length > 0 && (
              <div className="text-center p-4 bg-dark-secondary rounded-lg border border-dark-border">
                <p className="text-sm text-text-secondary mb-2">
                  {supplements.filter(s => getSupplementStatus(s)).length} of {supplements.length} taken today
                </p>
                <div className="w-full bg-dark-elevated rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-accent-red to-accent-light-red h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionRate()}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {supplements.length === 0 ? (
                <div className="bg-dark-secondary rounded-lg border border-dark-border">
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <PieChart className="mr-3 text-accent-red" size={24} />
                    <h3 className="text-lg font-medium text-text-primary mb-2 font-['Montserrat']">
                      No supplements added yet
                    </h3>
                    <p className="text-text-secondary text-center mb-6">
                      Start tracking your supplements by adding them to your routine.
                    </p>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-accent-red hover:bg-accent-light-red text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Supplement
                    </Button>
                  </div>
                </div>
              ) : (
                supplements.map((supplement) => {
                  const isTaken = getSupplementStatus(supplement);
                  const log = todayLogs.find(log => log.supplementId === supplement.id);

                  return (
                    <div key={supplement.id} className={`bg-dark-secondary rounded-lg border transition-all duration-200 ${isTaken ? 'border-accent-green bg-accent-green/5' : 'border-dark-border'}`}>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 rounded-full ${isTaken ? 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30' : 'border border-dark-border text-text-disabled hover:bg-dark-elevated'}`}
                              onClick={() => toggleSupplementLog(supplement)}
                            >
                              {isTaken ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                            </Button>

                            <div>
                              <h3 className="font-medium text-text-primary font-['Montserrat']">
                                {supplement.name}
                                {supplement.brand && <span className="text-text-secondary font-normal"> by {supplement.brand}</span>}
                              </h3>
                              <p className="text-sm text-text-secondary">
                                {supplement.dosage} {supplement.unit} • {supplement.frequency.replace('_', ' ')}
                                {supplement.timingPreference && ` • ${supplement.timingPreference.replace('_', ' ')}`}
                              </p>
                              {log?.time && (
                                <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  Taken at {log.time}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className={`px-2 py-1 rounded text-xs font-medium ${isTaken ? 'bg-accent-green/20 text-accent-green' : 'bg-dark-elevated text-text-secondary'}`}>
                            {supplement.type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4 mt-6">
            {supplements.length === 0 ? (
              <div className="bg-dark-secondary rounded-lg border border-dark-border">
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <Pill className="w-16 h-16 text-text-disabled mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2 font-['Montserrat']">
                    No supplements to manage
                  </h3>
                  <p className="text-text-secondary text-center mb-6">
                    Add some supplements to start managing your routine.
                  </p>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-accent-red hover:bg-accent-light-red text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Supplement
                  </Button>
                </div>
              </div>
            ) : (
              supplements.map((supplement) => (
                <div key={supplement.id} className="bg-dark-secondary rounded-lg border border-dark-border">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-text-primary font-['Montserrat']">
                          {supplement.name}
                          {supplement.brand && <span className="text-text-secondary font-normal"> by {supplement.brand}</span>}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {supplement.dosage} {supplement.unit} • {supplement.frequency.replace('_', ' ')}
                          {supplement.timingPreference && ` • ${supplement.timingPreference.replace('_', ' ')}`}
                        </p>
                        {supplement.notes && (
                          <p className="text-xs text-text-secondary mt-1">
                            {supplement.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="px-2 py-1 bg-dark-elevated rounded text-xs font-medium text-text-secondary">
                            {supplement.type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(supplement)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(supplement)}
                          className="text-accent-red hover:text-accent-light-red hover:bg-accent-red/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
