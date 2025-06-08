import { z } from "zod";

// Exercise Set Schema
export const exerciseSetSchema = z.object({
  id: z.string(),
  weight: z.number().min(0),
  reps: z.number().min(0),
  completed: z.boolean().default(false),
  restTime: z.number().default(150), // 2:30 in seconds
});

export type ExerciseSet = z.infer<typeof exerciseSetSchema>;

// Exercise Schema
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sets: z.array(exerciseSetSchema),
  notes: z.string().optional(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

// Workout Schema
export const workoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  date: z.string(), // ISO date string
  exercises: z.array(exerciseSchema),
  duration: z.number().optional(), // in minutes
  notes: z.string().optional(),
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
  })),
  estimatedDuration: z.number().optional(), // in minutes
  category: z.string().optional(), // e.g., "Push", "Pull", "Legs", "Cardio"
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
