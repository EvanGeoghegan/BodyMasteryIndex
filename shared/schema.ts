import { z } from "zod";
import { pgTable, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Exercise Set Schema
export const exerciseSetSchema = z.object({
  id: z.string(),
  weight: z.number().min(0).optional(),
  reps: z.number().min(0).optional(),
  duration: z.number().min(0).optional(), // for cardio exercises in minutes
  distance: z.number().min(0).optional(), // for cardio exercises
  restTime: z.number().min(0).optional(), // manual rest input in seconds
  completed: z.boolean().default(false),
});

export type ExerciseSet = z.infer<typeof exerciseSetSchema>;

// Exercise Schema
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sets: z.array(exerciseSetSchema),
  notes: z.string().optional(),
  type: z.enum(["strength", "cardio"]).default("strength"),
  cardioType: z.enum(["zone2", "low_intensity", "high_intensity", "intervals", "sprints", "steps"]).optional(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

// Workout Schema
export const workoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  date: z.string(), // ISO date string
  exercises: z.array(exerciseSchema),
  notes: z.string().optional(),
  type: z.enum(["strength", "cardio", "mixed"]).default("strength"),
});

export type Workout = z.infer<typeof workoutSchema>;

// Template Schema
export const templateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.number().min(1),
    suggestedWeight: z.number().optional(),
    suggestedReps: z.number().optional(),
    suggestedDuration: z.number().optional(), // for cardio
    suggestedDistance: z.number().optional(), // for cardio
    type: z.enum(["strength", "cardio"]).default("strength"),
    cardioType: z.enum(["zone2", "low_intensity", "high_intensity", "intervals", "sprints", "steps"]).optional(),
  })),
  estimatedDuration: z.number().optional(), // in minutes
  category: z.string().optional(), // e.g., "Push", "Pull", "Legs", "Cardio"
  type: z.enum(["strength", "cardio", "mixed"]).default("strength"),
});

export type Template = z.infer<typeof templateSchema>;

// Personal Best Schema
export const personalBestSchema = z.object({
  id: z.string(),
  exerciseName: z.string(),
  weight: z.number(),
  reps: z.number(),
  date: z.string(), // ISO date string
  type: z.enum(["1RM", "volume"]), // One rep max or volume PR
  category: z.string().optional(), // e.g., "Chest", "Back", "Legs"
});

export type PersonalBest = z.infer<typeof personalBestSchema>;

// Insert schemas
export const insertWorkoutSchema = workoutSchema.omit({ id: true });
export const insertTemplateSchema = templateSchema.omit({ id: true });
export const insertPersonalBestSchema = personalBestSchema.omit({ id: true });

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type InsertPersonalBest = z.infer<typeof insertPersonalBestSchema>;

// Quote Schema
export const quoteSchema = z.object({
  text: z.string(),
  author: z.string(),
});

export type Quote = z.infer<typeof quoteSchema>;

// Database Tables
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workouts = pgTable("workouts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  exercises: jsonb("exercises").notNull(),
  notes: text("notes"),
  type: text("type").notNull().default("strength"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  exercises: jsonb("exercises").notNull(),
  estimatedDuration: integer("estimated_duration"),
  category: text("category"),
  type: text("type").notNull().default("strength"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const personalBests = pgTable("personal_bests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  exerciseName: text("exercise_name").notNull(),
  weight: integer("weight").notNull(),
  reps: integer("reps").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Database types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DbWorkout = typeof workouts.$inferSelect;
export type InsertDbWorkout = typeof workouts.$inferInsert;
export type DbTemplate = typeof templates.$inferSelect;
export type InsertDbTemplate = typeof templates.$inferInsert;
export type DbPersonalBest = typeof personalBests.$inferSelect;
export type InsertDbPersonalBest = typeof personalBests.$inferInsert;
