import { useState, useEffect } from "react";
import { Plus, Pill, Clock, UtensilsCrossed, Trash2, Edit, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSupplementSchema, Supplement, SupplementLog, InsertSupplement, InsertSupplementLog } from "@shared/schema";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { PieChart as RechartsPieChart, Pie, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/PageHeader";

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
  const [activeTab, setActiveTab] = useState("today");
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayLogs, setTodayLogs] = useState<SupplementLog[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [currentProtein, setCurrentProtein] = useState(0);
  const [currentWater, setCurrentWater] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'protein' | 'water' | null>(null);
  const [sliderValue, setSliderValue] = useState(0);

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

  const getCheckpointMessage = (percent: number) => {
    if (percent >= 100) return "Goal Complete! 🎉";
    if (percent >= 75) return "Almost there!";
    if (percent >= 50) return "Halfway there!";
    if (percent >= 25) return "Great start!";
    return ""; // Return empty string if less than 25%
  };

  const refreshData = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedSettings = localStorage.getItem('bmi_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setProteinGoal(settings.proteinGoal || 150);
        setWaterGoal(settings.waterGoal || 3.0);
      }

      const nutritionData = localStorage.getItem(`nutrition_${today}`);
      if (nutritionData) {
        const data = JSON.parse(nutritionData);
        setCurrentProtein(data.protein || 0);
        setCurrentWater(data.water || 0);
      } else {
        setCurrentProtein(0);
        setCurrentWater(0);
      }

      setSupplements(storage.getSupplements());
      setTodayLogs(storage.getSupplementLogs(selectedDate));
    } catch (error) {
      console.error("Error refreshing data:", error);
      // Optionally, set a state to show an error message to the user
    }
  };


  useEffect(() => {
    refreshData();
  }, [selectedDate]);

  const saveNutritionData = (protein: number, water: number) => {
    const today = new Date().toISOString().split('T')[0];
    const nutritionData = { protein, water, date: today };
    localStorage.setItem(`nutrition_${today}`, JSON.stringify(nutritionData));
  };

  const handleAddIntake = () => {
    if (activeMetric && sliderValue > 0) {
      if (activeMetric === 'protein') {
        const newProtein = Math.round((currentProtein + sliderValue) * 10) / 10;
        setCurrentProtein(newProtein);
        saveNutritionData(newProtein, currentWater);
      } else { // water
        const newWater = Math.round((currentWater + (sliderValue / 1000)) * 10) / 10;
        setCurrentWater(newWater);
        saveNutritionData(currentProtein, newWater);
      }
    }
    setIsDrawerOpen(false);
  };

  const handleReset = (metric: 'protein' | 'water') => {
    if (metric === 'protein') {
      setCurrentProtein(0);
      saveNutritionData(0, currentWater);
    } else {
      setCurrentWater(0);
      saveNutritionData(currentProtein, 0);
    }
  };

  const openDrawer = (metric: 'protein' | 'water') => {
    setActiveMetric(metric);
    setSliderValue(0);
    setIsDrawerOpen(true);
  };

  const onSubmit = (data: InsertSupplement) => {
    try {
      if (editingSupplement) {
        storage.updateSupplement(editingSupplement.id, data);
      } else {
        storage.createSupplement(data);
      }
      refreshData();
      setIsAddDialogOpen(false);
      setEditingSupplement(null);
      form.reset();
    } catch (error) {
      console.error("Failed to save supplement", error);
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
      <PageHeader
        icon={<UtensilsCrossed className="text-accent-red mr-4" size={28} />}
        title="Macro Tracker"
        subtitle="Log your daily macro/micronutrients."
      />

      <div className="p-4 space-y-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border cursor-pointer hover:bg-dark-elevated transition-colors" onClick={() => openDrawer('protein')}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-primary">Protein</h3>
              <Button onClick={(e) => { e.stopPropagation(); handleReset('protein')}} variant="ghost" size="sm" className="text-xs text-text-secondary hover:text-text-primary">
                <RotateCcw size={12} className="mr-1" /> Reset
              </Button>
            </div>
            {/* Increased size from w-24 h-24 to w-32 h-32 */}
            <div className="relative w-32 h-32 mx-auto mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  {/* Adjusted radius for a bigger chart */}
                  <Pie data={[{ value: Math.min(currentProtein, proteinGoal || 1), fill: 'var(--accent-red)' }, { value: Math.max(0, (proteinGoal || 1) - currentProtein), fill: 'var(--dark-elevated)' }]} cx="50%" cy="50%" innerRadius={40} outerRadius={60} startAngle={90} endAngle={-270} dataKey="value" paddingAngle={currentProtein > 0 ? 2 : 0} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-text-primary">{Math.round((currentProtein / (proteinGoal || 1)) * 100)}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-accent-red">{currentProtein}g</div>
              <div className="text-xs text-text-secondary">of {proteinGoal}g</div>
              {/* Added motivational message */}
              <p className="text-xs text-accent-green mt-2 h-4">{getCheckpointMessage((currentProtein / (proteinGoal || 1)) * 100)}</p>
            </div>
          </div>

          <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border cursor-pointer hover:bg-dark-elevated transition-colors" onClick={() => openDrawer('water')}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-primary">Water</h3>
               <Button onClick={(e) => { e.stopPropagation(); handleReset('water')}} variant="ghost" size="sm" className="text-xs text-text-secondary hover:text-text-primary">
                <RotateCcw size={12} className="mr-1" /> Reset
              </Button>
            </div>
            {/* Increased size from w-24 h-24 to w-32 h-32 */}
            <div className="relative w-32 h-32 mx-auto mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  {/* Adjusted radius for a bigger chart */}
                  <Pie data={[{ value: Math.min(currentWater, waterGoal || 1), fill: 'hsl(210, 80%, 60%)' }, { value: Math.max(0, (waterGoal || 1) - currentWater), fill: 'var(--dark-elevated)' }]} cx="50%" cy="50%" innerRadius={40} outerRadius={60} startAngle={90} endAngle={-270} dataKey="value" paddingAngle={currentWater > 0 ? 2 : 0} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-text-primary">{Math.round((currentWater / (waterGoal || 1)) * 100)}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{currentWater.toFixed(1)}L</div>
              <div className="text-xs text-text-secondary">of {waterGoal.toFixed(1)}L</div>
              {/* Added motivational message */}
              <p className="text-xs text-accent-green mt-2 h-4">{getCheckpointMessage((currentWater / (waterGoal || 1)) * 100)}</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    className="bg-accent-red h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionRate()}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {supplements.length === 0 ? (
                <div className="bg-dark-secondary rounded-lg border border-dark-border">
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <Pill className="w-16 h-16 text-text-disabled mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2 font-['Montserrat']">
                      No supplements added yet
                    </h3>
                    <p className="text-text-secondary text-center mb-6">
                      Start tracking your supplements by adding them to your routine.
                    </p>
                    <Button onClick={() => setActiveTab("manage")} className="bg-accent-red hover:bg-accent-light-red text-white">
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
                                {supplement.dosage} {supplement.unit} • {supplement.frequency.replace(/_/g, ' ')}
                                {supplement.timingPreference && ` • ${supplement.timingPreference.replace(/_/g, ' ')}`}
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
                            {supplement.type.replace(/_/g, ' ')}
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
            <Button
              onClick={() => { form.reset(); setEditingSupplement(null); setIsAddDialogOpen(true); }}
              className="w-full bg-accent-red hover:bg-accent-light-red text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Supplement
            </Button>
            {supplements.length === 0 ? (
              <div className="bg-dark-secondary rounded-lg border border-dark-border">
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <Pill className="w-16 h-16 text-text-disabled mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2 font-['Montserrat']">
                    No supplements to manage
                  </h3>
                  <p className="text-text-secondary text-center">
                    Add some supplements to start managing your routine.
                  </p>
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
                          {supplement.dosage} {supplement.unit} • {supplement.frequency.replace(/_/g, ' ')}
                          {supplement.timingPreference && ` • ${supplement.timingPreference.replace(/_/g, ' ')}`}
                        </p>
                        {supplement.notes && (
                          <p className="text-xs text-text-secondary mt-1">
                            {supplement.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="px-2 py-1 bg-dark-elevated rounded text-xs font-medium text-text-secondary">
                            {supplement.type.replace(/_/g, ' ')}
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

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Log {activeMetric === 'protein' ? 'Protein' : 'Water'}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="text-center">
              <span className={cn("text-4xl font-bold", activeMetric === 'protein' ? 'text-accent-red' : 'text-blue-500')}>
                {sliderValue}
              </span>
              <span className="text-lg text-text-secondary">
                {activeMetric === 'protein' ? 'g' : 'ml'}
              </span>
            </div>
            <Slider
              style={{ '--slider-track-color': activeMetric === 'protein' ? 'var(--accent-red)' : 'hsl(210, 80%, 60%)' } as React.CSSProperties}
              value={[sliderValue]}
              onValueChange={(value) => setSliderValue(value[0])}
              max={activeMetric === 'protein' ? 100 : 1000}
              step={activeMetric === 'protein' ? 1 : 50}
              className="[&>span:first-child>span]:bg-[--slider-track-color]"
            />
          </div>
          <DrawerFooter className="pt-2">
            <Button onClick={handleAddIntake} className={cn(activeMetric === 'protein' ? 'bg-accent-red' : 'bg-blue-500 hover:bg-blue-600')}>Add Intake</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setEditingSupplement(null); form.reset(); } setIsAddDialogOpen(isOpen); }}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="bg-dark-elevated border-dark-border text-text-secondary"> Cancel </Button>
                </DialogClose>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}