import { 
  users, 
  workouts, 
  templates, 
  personalBests,
  type User, 
  type InsertUser,
  type Workout,
  type InsertWorkout,
  type Template,
  type InsertTemplate,
  type PersonalBest,
  type InsertPersonalBest,
  type Supplement,
  type InsertSupplement,
  type SupplementLog,
  type InsertSupplementLog,
  type DbWorkout,
  type InsertDbWorkout,
  type DbTemplate,
  type InsertDbTemplate,
  type DbPersonalBest,
  type InsertDbPersonalBest
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workout methods
  getWorkouts(userId: number): Promise<Workout[]>;
  getWorkout(userId: number, id: string): Promise<Workout | undefined>;
  createWorkout(userId: number, workout: InsertWorkout): Promise<Workout>;
  updateWorkout(userId: number, id: string, updates: Partial<Workout>): Promise<Workout | undefined>;
  deleteWorkout(userId: number, id: string): Promise<boolean>;
  
  // Template methods
  getTemplates(userId: number): Promise<Template[]>;
  getTemplate(userId: number, id: string): Promise<Template | undefined>;
  createTemplate(userId: number, template: InsertTemplate): Promise<Template>;
  updateTemplate(userId: number, id: string, updates: Partial<Template>): Promise<Template | undefined>;
  deleteTemplate(userId: number, id: string): Promise<boolean>;
  
  // Personal best methods
  getPersonalBests(userId: number): Promise<PersonalBest[]>;
  getPersonalBest(userId: number, id: string): Promise<PersonalBest | undefined>;
  createPersonalBest(userId: number, personalBest: InsertPersonalBest): Promise<PersonalBest>;
  updatePersonalBest(userId: number, id: string, updates: Partial<PersonalBest>): Promise<PersonalBest | undefined>;
  deletePersonalBest(userId: number, id: string): Promise<boolean>;
  
  // Supplement methods
  getSupplements(userId: number): Promise<Supplement[]>;
  getSupplement(userId: number, id: string): Promise<Supplement | undefined>;
  createSupplement(userId: number, supplement: InsertSupplement): Promise<Supplement>;
  updateSupplement(userId: number, id: string, updates: Partial<Supplement>): Promise<Supplement | undefined>;
  deleteSupplement(userId: number, id: string): Promise<boolean>;
  
  // Supplement log methods
  getSupplementLogs(userId: number, date?: string): Promise<SupplementLog[]>;
  getSupplementLog(userId: number, id: string): Promise<SupplementLog | undefined>;
  createSupplementLog(userId: number, log: InsertSupplementLog): Promise<SupplementLog>;
  updateSupplementLog(userId: number, id: string, updates: Partial<SupplementLog>): Promise<SupplementLog | undefined>;
  deleteSupplementLog(userId: number, id: string): Promise<boolean>;
  
  // Utility methods
  getWorkoutDays(userId: number): Promise<string[]>;
  getLastWorkout(userId: number): Promise<Workout | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Workout methods
  async getWorkouts(userId: number): Promise<Workout[]> {
    const dbWorkouts = await db.select().from(workouts).where(eq(workouts.userId, userId));
    return dbWorkouts.map(this.dbWorkoutToWorkout);
  }

  async getWorkout(userId: number, id: string): Promise<Workout | undefined> {
    const [dbWorkout] = await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.id, parseInt(id)), eq(workouts.userId, userId)));
    return dbWorkout ? this.dbWorkoutToWorkout(dbWorkout) : undefined;
  }

  async createWorkout(userId: number, workout: InsertWorkout): Promise<Workout> {
    const [dbWorkout] = await db
      .insert(workouts)
      .values({
        userId,
        name: workout.name,
        date: workout.date,
        exercises: workout.exercises,
        notes: workout.notes,
        type: workout.type || "strength"
      })
      .returning();
    return this.dbWorkoutToWorkout(dbWorkout);
  }

  async updateWorkout(userId: number, id: string, updates: Partial<Workout>): Promise<Workout | undefined> {
    const [dbWorkout] = await db
      .update(workouts)
      .set({
        name: updates.name,
        date: updates.date,
        exercises: updates.exercises,
        notes: updates.notes,
        type: updates.type
      })
      .where(and(eq(workouts.id, parseInt(id)), eq(workouts.userId, userId)))
      .returning();
    return dbWorkout ? this.dbWorkoutToWorkout(dbWorkout) : undefined;
  }

  async deleteWorkout(userId: number, id: string): Promise<boolean> {
    const result = await db
      .delete(workouts)
      .where(and(eq(workouts.id, parseInt(id)), eq(workouts.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Template methods
  async getTemplates(userId: number): Promise<Template[]> {
    const dbTemplates = await db.select().from(templates).where(eq(templates.userId, userId));
    return dbTemplates.map(this.dbTemplateToTemplate);
  }

  async getTemplate(userId: number, id: string): Promise<Template | undefined> {
    const [dbTemplate] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, parseInt(id)), eq(templates.userId, userId)));
    return dbTemplate ? this.dbTemplateToTemplate(dbTemplate) : undefined;
  }

  async createTemplate(userId: number, template: InsertTemplate): Promise<Template> {
    const [dbTemplate] = await db
      .insert(templates)
      .values({
        userId,
        name: template.name,
        description: template.description,
        exercises: template.exercises,
        estimatedDuration: template.estimatedDuration,
        category: template.category,
        type: template.type || "strength"
      })
      .returning();
    return this.dbTemplateToTemplate(dbTemplate);
  }

  async updateTemplate(userId: number, id: string, updates: Partial<Template>): Promise<Template | undefined> {
    const [dbTemplate] = await db
      .update(templates)
      .set({
        name: updates.name,
        description: updates.description,
        exercises: updates.exercises,
        estimatedDuration: updates.estimatedDuration,
        category: updates.category,
        type: updates.type
      })
      .where(and(eq(templates.id, parseInt(id)), eq(templates.userId, userId)))
      .returning();
    return dbTemplate ? this.dbTemplateToTemplate(dbTemplate) : undefined;
  }

  async deleteTemplate(userId: number, id: string): Promise<boolean> {
    const result = await db
      .delete(templates)
      .where(and(eq(templates.id, parseInt(id)), eq(templates.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Personal best methods
  async getPersonalBests(userId: number): Promise<PersonalBest[]> {
    const dbPersonalBests = await db.select().from(personalBests).where(eq(personalBests.userId, userId));
    return dbPersonalBests.map(this.dbPersonalBestToPersonalBest);
  }

  async getPersonalBest(userId: number, id: string): Promise<PersonalBest | undefined> {
    const [dbPersonalBest] = await db
      .select()
      .from(personalBests)
      .where(and(eq(personalBests.id, parseInt(id)), eq(personalBests.userId, userId)));
    return dbPersonalBest ? this.dbPersonalBestToPersonalBest(dbPersonalBest) : undefined;
  }

  async createPersonalBest(userId: number, personalBest: InsertPersonalBest): Promise<PersonalBest> {
    const [dbPersonalBest] = await db
      .insert(personalBests)
      .values({
        userId,
        exerciseName: personalBest.exerciseName,
        weight: personalBest.weight,
        reps: personalBest.reps,
        date: personalBest.date,
        type: personalBest.type,
        category: personalBest.category
      })
      .returning();
    return this.dbPersonalBestToPersonalBest(dbPersonalBest);
  }

  async updatePersonalBest(userId: number, id: string, updates: Partial<PersonalBest>): Promise<PersonalBest | undefined> {
    const [dbPersonalBest] = await db
      .update(personalBests)
      .set({
        exerciseName: updates.exerciseName,
        weight: updates.weight,
        reps: updates.reps,
        date: updates.date,
        type: updates.type,
        category: updates.category
      })
      .where(and(eq(personalBests.id, parseInt(id)), eq(personalBests.userId, userId)))
      .returning();
    return dbPersonalBest ? this.dbPersonalBestToPersonalBest(dbPersonalBest) : undefined;
  }

  async deletePersonalBest(userId: number, id: string): Promise<boolean> {
    const result = await db
      .delete(personalBests)
      .where(and(eq(personalBests.id, parseInt(id)), eq(personalBests.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Utility methods
  async getWorkoutDays(userId: number): Promise<string[]> {
    const userWorkouts = await this.getWorkouts(userId);
    return userWorkouts.map(workout => workout.date);
  }

  async getLastWorkout(userId: number): Promise<Workout | undefined> {
    const userWorkouts = await this.getWorkouts(userId);
    if (userWorkouts.length === 0) return undefined;
    
    return userWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }

  // Helper methods to convert database objects to app objects
  private dbWorkoutToWorkout(dbWorkout: DbWorkout): Workout {
    return {
      id: dbWorkout.id.toString(),
      name: dbWorkout.name,
      date: dbWorkout.date,
      exercises: dbWorkout.exercises as any,
      notes: dbWorkout.notes || undefined,
      type: dbWorkout.type as any
    };
  }

  private dbTemplateToTemplate(dbTemplate: DbTemplate): Template {
    return {
      id: dbTemplate.id.toString(),
      name: dbTemplate.name,
      description: dbTemplate.description || undefined,
      exercises: dbTemplate.exercises as any,
      estimatedDuration: dbTemplate.estimatedDuration || undefined,
      category: dbTemplate.category || undefined,
      type: dbTemplate.type as any
    };
  }

  private dbPersonalBestToPersonalBest(dbPersonalBest: DbPersonalBest): PersonalBest {
    return {
      id: dbPersonalBest.id.toString(),
      exerciseName: dbPersonalBest.exerciseName,
      weight: dbPersonalBest.weight,
      reps: dbPersonalBest.reps,
      date: dbPersonalBest.date,
      type: dbPersonalBest.type as any,
      category: dbPersonalBest.category || undefined
    };
  }
}

export const storage = new DatabaseStorage();