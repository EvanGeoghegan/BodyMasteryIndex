import { Workout, Template, PersonalBest, InsertWorkout, InsertTemplate, InsertPersonalBest } from "@shared/schema";

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
  initializeDefaultTemplates(): void {
    const existingTemplates = this.getTemplates();
    if (existingTemplates.length > 0) return;

    const defaultTemplates: InsertTemplate[] = [
      {
        name: "Push Day",
        description: "Chest, Shoulders, Triceps",
        category: "Push",
        estimatedDuration: 75,
        exercises: [
          { name: "Bench Press", sets: 4, suggestedWeight: 135, suggestedReps: 8 },
          { name: "Overhead Press", sets: 4, suggestedWeight: 95, suggestedReps: 8 },
          { name: "Incline Dumbbell Press", sets: 3, suggestedWeight: 50, suggestedReps: 10 },
          { name: "Lateral Raises", sets: 3, suggestedWeight: 15, suggestedReps: 12 },
          { name: "Tricep Dips", sets: 3, suggestedReps: 10 },
          { name: "Push-ups", sets: 3, suggestedReps: 15 }
        ]
      },
      {
        name: "Pull Day",
        description: "Back, Biceps",
        category: "Pull",
        estimatedDuration: 60,
        exercises: [
          { name: "Deadlift", sets: 4, suggestedWeight: 225, suggestedReps: 6 },
          { name: "Pull-ups", sets: 4, suggestedReps: 8 },
          { name: "Barbell Rows", sets: 4, suggestedWeight: 135, suggestedReps: 8 },
          { name: "Lat Pulldowns", sets: 3, suggestedWeight: 120, suggestedReps: 10 },
          { name: "Bicep Curls", sets: 3, suggestedWeight: 25, suggestedReps: 12 }
        ]
      },
      {
        name: "Leg Day",
        description: "Quads, Hamstrings, Glutes, Calves",
        category: "Legs",
        estimatedDuration: 90,
        exercises: [
          { name: "Squat", sets: 4, suggestedWeight: 185, suggestedReps: 8 },
          { name: "Romanian Deadlift", sets: 4, suggestedWeight: 135, suggestedReps: 8 },
          { name: "Bulgarian Split Squats", sets: 3, suggestedWeight: 25, suggestedReps: 10 },
          { name: "Leg Press", sets: 3, suggestedWeight: 300, suggestedReps: 12 },
          { name: "Leg Curls", sets: 3, suggestedWeight: 80, suggestedReps: 12 },
          { name: "Calf Raises", sets: 4, suggestedWeight: 45, suggestedReps: 15 },
          { name: "Walking Lunges", sets: 3, suggestedReps: 20 }
        ]
      },
      {
        name: "Cardio HIIT",
        description: "High Intensity Interval Training",
        category: "Cardio",
        estimatedDuration: 25,
        exercises: [
          { name: "Burpees", sets: 4, suggestedReps: 10 },
          { name: "Mountain Climbers", sets: 4, suggestedReps: 20 },
          { name: "Jump Squats", sets: 4, suggestedReps: 15 },
          { name: "High Knees", sets: 4, suggestedReps: 30 }
        ]
      }
    ];

    defaultTemplates.forEach(template => this.createTemplate(template));
  }
}

export const storage = new LocalStorage();
