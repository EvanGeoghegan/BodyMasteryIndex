import { Workout, Template, PersonalBest, InsertWorkout, InsertTemplate, InsertPersonalBest, Supplement, InsertSupplement, SupplementLog, InsertSupplementLog } from "@shared/schema";

class LocalStorage {
  private getStorageKey(key: string): string {
    return `trainlog_${key}`;
  }

  private getData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(key));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return [];
    }
  }

  private setData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  // Workouts
  getWorkouts(): Workout[] {
    return this.getData<Workout>('workouts');
  }

  getWorkout(id: string): Workout | undefined {
    return this.getWorkouts().find(w => w.id === id);
  }

  createWorkout(workout: InsertWorkout): Workout {
    const newWorkout: Workout = {
      ...workout,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const workouts = this.getWorkouts();
    workouts.push(newWorkout);
    this.setData('workouts', workouts);

    return newWorkout;
  }

  updateWorkout(id: string, updates: Partial<Workout>): Workout | undefined {
    const workouts = this.getWorkouts();
    const index = workouts.findIndex(w => w.id === id);

    if (index === -1) return undefined;

    workouts[index] = { ...workouts[index], ...updates };
    this.setData('workouts', workouts);

    return workouts[index];
  }

  deleteWorkout(id: string): boolean {
    const workouts = this.getWorkouts();
    const filtered = workouts.filter(w => w.id !== id);

    if (filtered.length === workouts.length) return false;

    this.setData('workouts', filtered);
    return true;
  }

  // Templates
  getTemplates(): Template[] {
    return this.getData<Template>('templates');
  }

  getTemplate(id: string): Template | undefined {
    return this.getTemplates().find(t => t.id === id);
  }

  createTemplate(template: InsertTemplate): Template {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const templates = this.getTemplates();
    templates.push(newTemplate);
    this.setData('templates', templates);

    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<Template>): Template | undefined {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) return undefined;

    templates[index] = { ...templates[index], ...updates };
    this.setData('templates', templates);

    return templates[index];
  }

  deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);

    if (filtered.length === templates.length) return false;

    this.setData('templates', filtered);
    return true;
  }

  // Personal Bests
  getPersonalBests(): PersonalBest[] {
    return this.getData<PersonalBest>('personalBests');
  }

  getPersonalBest(id: string): PersonalBest | undefined {
    return this.getPersonalBests().find(pb => pb.id === id);
  }

  createPersonalBest(personalBest: InsertPersonalBest): PersonalBest {
    const newPB: PersonalBest = {
      ...personalBest,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const personalBests = this.getPersonalBests();
    personalBests.push(newPB);
    this.setData('personalBests', personalBests);

    return newPB;
  }

  updatePersonalBest(id: string, updates: Partial<PersonalBest>): PersonalBest | undefined {
    const personalBests = this.getPersonalBests();
    const index = personalBests.findIndex(pb => pb.id === id);

    if (index === -1) return undefined;

    personalBests[index] = { ...personalBests[index], ...updates };
    this.setData('personalBests', personalBests);

    return personalBests[index];
  }

  deletePersonalBest(id: string): boolean {
    const personalBests = this.getPersonalBests();
    const filtered = personalBests.filter(pb => pb.id !== id);

    if (filtered.length === personalBests.length) return false;

    this.setData('personalBests', filtered);
    return true;
  }
  // ADD THIS ENTIRE FUNCTION
  getLastPerformance(exerciseName: string): { weight: number; reps: number; date: string } | null {
    const allWorkouts = this.getWorkouts();
    let lastPerformance = null;

    // We go through all workouts in chronological order
    for (const workout of allWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())) {
      for (const exercise of workout.exercises) {
        if (exercise.name.toLowerCase() === exerciseName.toLowerCase() && exercise.type === 'strength') {
          // Find the best completed set in this workout for this exercise
          const bestSet = exercise.sets
            .filter(set => set.completed && set.weight && set.reps)
            .reduce((best, current) => {
              if (!current.weight || !current.reps) return best;
              if (!best.weight || !best.reps) return current;

              const best1RM = best.weight * (1 + best.reps / 30);
              const current1RM = current.weight * (1 + current.reps / 30);
              return current1RM > best1RM ? current : best;
            }, {} as { weight?: number, reps?: number });

          if (bestSet.weight && bestSet.reps) {
            lastPerformance = {
              weight: bestSet.weight,
              reps: bestSet.reps,
              date: workout.date,
            };
          }
        }
      }
    }
    return lastPerformance;
  }

  // Get workout days for calendar
  getWorkoutDays(): string[] {
    return this.getWorkouts().map(w => w.date.split('T')[0]);
  }

  // Get last workout
  getLastWorkout(): Workout | undefined {
    const workouts = this.getWorkouts();
    return workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }

  // Initialize default templates
  // Supplement methods
  getSupplements(): Supplement[] {
    return this.getData<Supplement>('supplements');
  }

  getSupplementById(id: string): Supplement | undefined {
    const supplements = this.getSupplements();
    return supplements.find(s => s.id === id);
  }

  getSupplement(id: string): Supplement | undefined {
    const supplements = this.getSupplements();
    return supplements.find(s => s.id === id);
  }

  createSupplement(supplement: InsertSupplement): Supplement {
    const newSupplement: Supplement = {
      ...supplement,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const supplements = this.getSupplements();
    supplements.push(newSupplement);
    this.setData('supplements', supplements);
    return newSupplement;
  }

  updateSupplement(id: string, updates: Partial<Supplement>): Supplement | undefined {
    const supplements = this.getSupplements();
    const index = supplements.findIndex(s => s.id === id);

    if (index === -1) return undefined;

    supplements[index] = { ...supplements[index], ...updates };
    this.setData('supplements', supplements);
    return supplements[index];
  }

  deleteSupplement(id: string): boolean {
    const supplements = this.getSupplements();
    const filteredSupplements = supplements.filter(s => s.id !== id);

    if (filteredSupplements.length === supplements.length) return false;

    this.setData('supplements', filteredSupplements);

    // Also delete all logs for this supplement
    const logs = this.getSupplementLogs();
    const filteredLogs = logs.filter(l => l.supplementId !== id);
    this.setData('supplementLogs', filteredLogs);

    return true;
  }

  // Supplement log methods
  getSupplementLogs(date?: string): SupplementLog[] {
    const logs = this.getData<SupplementLog>('supplementLogs');
    if (date) {
      return logs.filter(log => log.date === date);
    }
    return logs;
  }

  getSupplementLog(id: string): SupplementLog | undefined {
    const logs = this.getSupplementLogs();
    return logs.find(l => l.id === id);
  }

  createSupplementLog(log: InsertSupplementLog): SupplementLog {
    const newLog: SupplementLog = {
      ...log,
      id: crypto.randomUUID(),
    };

    const logs = this.getSupplementLogs();
    logs.push(newLog);
    this.setData('supplementLogs', logs);
    return newLog;
  }

  updateSupplementLog(id: string, updates: Partial<SupplementLog>): SupplementLog | undefined {
    const logs = this.getSupplementLogs();
    const index = logs.findIndex(l => l.id === id);

    if (index === -1) return undefined;

    logs[index] = { ...logs[index], ...updates };
    this.setData('supplementLogs', logs);
    return logs[index];
  }

  deleteSupplementLog(id: string): boolean {
    const logs = this.getSupplementLogs();
    const filteredLogs = logs.filter(l => l.id !== id);

    if (filteredLogs.length === logs.length) return false;

    this.setData('supplementLogs', filteredLogs);
    return true;
  }

  // Clear only workout data
  clearWorkouts(): void {
    localStorage.removeItem(this.getStorageKey('workouts'));
    localStorage.removeItem(this.getStorageKey('personalBests'));
    localStorage.removeItem('congratsDismissedDate');
    localStorage.removeItem('lastWorkoutDate');
    localStorage.removeItem('lastCongratsDate');
  }

  // Reset all user data
  resetAllData(): void {
    // Clear all training log data
    localStorage.removeItem(this.getStorageKey('workouts'));
    localStorage.removeItem(this.getStorageKey('templates'));
    localStorage.removeItem(this.getStorageKey('personalBests'));
    localStorage.removeItem(this.getStorageKey('supplements'));
    localStorage.removeItem(this.getStorageKey('supplementLogs'));

    // Clear other app data
    localStorage.removeItem('congratsDismissedDate');
    localStorage.removeItem('lastWorkoutDate');
    localStorage.removeItem('lastCongratsDate');

    // Reinitialize default templates
    this.initializeDefaultTemplates();
  }

  initializeDefaultTemplates(): void {
    const existingTemplates = this.getTemplates();
    if (existingTemplates.length > 0) return;

    const defaultTemplates: InsertTemplate[] = [
      {
        name: "Push Day",
        description: "Chest, Shoulders, Triceps",
        category: "Push",
        type: "strength",
        estimatedDuration: 75,
        exercises: [
          { name: "Bench Press", sets: 4, suggestedWeight: 135, suggestedReps: 8, type: "strength" },
          { name: "Overhead Press", sets: 4, suggestedWeight: 95, suggestedReps: 8, type: "strength" },
          { name: "Incline Dumbbell Press", sets: 3, suggestedWeight: 50, suggestedReps: 10, type: "strength" },
          { name: "Lateral Raises", sets: 3, suggestedWeight: 15, suggestedReps: 12, type: "strength" },
          { name: "Tricep Dips", sets: 3, suggestedReps: 10, type: "strength" },
          { name: "Push-ups", sets: 3, suggestedReps: 15, type: "strength" }
        ]
      },
      {
        name: "Pull Day",
        description: "Back, Biceps",
        category: "Pull",
        type: "strength",
        estimatedDuration: 60,
        exercises: [
          { name: "Deadlift", sets: 4, suggestedWeight: 225, suggestedReps: 6, type: "strength" },
          { name: "Pull-ups", sets: 4, suggestedReps: 8, type: "strength" },
          { name: "Barbell Rows", sets: 4, suggestedWeight: 135, suggestedReps: 8, type: "strength" },
          { name: "Lat Pulldowns", sets: 3, suggestedWeight: 120, suggestedReps: 10, type: "strength" },
          { name: "Bicep Curls", sets: 3, suggestedWeight: 25, suggestedReps: 12, type: "strength" }
        ]
      },
      {
        name: "Leg Day",
        description: "Quads, Hamstrings, Glutes, Calves",
        category: "Legs",
        type: "strength",
        estimatedDuration: 90,
        exercises: [
          { name: "Squat", sets: 4, suggestedWeight: 185, suggestedReps: 8, type: "strength" },
          { name: "Romanian Deadlift", sets: 4, suggestedWeight: 135, suggestedReps: 8, type: "strength" },
          { name: "Bulgarian Split Squats", sets: 3, suggestedWeight: 25, suggestedReps: 10, type: "strength" },
          { name: "Leg Press", sets: 3, suggestedWeight: 300, suggestedReps: 12, type: "strength" },
          { name: "Leg Curls", sets: 3, suggestedWeight: 80, suggestedReps: 12, type: "strength" },
          { name: "Calf Raises", sets: 4, suggestedWeight: 45, suggestedReps: 15, type: "strength" },
          { name: "Walking Lunges", sets: 3, suggestedReps: 20, type: "strength" }
        ]
      },
      {
        name: "HIIT Cardio",
        description: "High Intensity Interval Training",
        category: "Cardio",
        type: "cardio",
        estimatedDuration: 25,
        exercises: [
          { name: "Running Intervals", sets: 4, suggestedDuration: 5, type: "cardio" },
          { name: "Cycling Sprints", sets: 6, suggestedDuration: 3, type: "cardio" },
          { name: "Jump Rope", sets: 3, suggestedDuration: 4, type: "cardio" }
        ]
      },
      {
        name: "Zone 2 Cardio",
        description: "Low Intensity Steady State",
        category: "Cardio",
        type: "cardio",
        estimatedDuration: 45,
        exercises: [
          { name: "Treadmill Walk", sets: 1, suggestedDuration: 45, suggestedDistance: 3, type: "cardio" },
          { name: "Stationary Bike", sets: 1, suggestedDuration: 30, type: "cardio" }
        ]
      },
      {
        name: "Step Challenge",
        description: "Daily step goal workout",
        category: "Cardio",
        type: "cardio",
        estimatedDuration: 60,
        exercises: [
          { name: "Walking", sets: 1, suggestedDistance: 5, type: "cardio" }
        ]
      }
    ];

    defaultTemplates.forEach(template => this.createTemplate(template));
  }
}

export const storage = new LocalStorage();
