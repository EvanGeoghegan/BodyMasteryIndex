import { storage } from './storage';
import Papa from 'papaparse';

export async function exportAllDataAsCSV(): Promise<Blob> {
  const workouts = storage.getWorkouts();
  const personalBests = storage.getPersonalBests();
  const bodyComp = JSON.parse(localStorage.getItem('body_composition_history') || '[]');
  const settings = JSON.parse(localStorage.getItem('bmi_settings') || '{}');

  const files = [];

  // 1. Workouts
  const workoutRows = workouts.map(w => ({
    date: w.date,
    name: w.name,
    exercises: w.exercises.map(e => e.name).join('; '),
  }));
  files.push({ name: 'workouts.csv', data: Papa.unparse(workoutRows) });

  // 2. Personal Bests
  const pbRows = personalBests.map(pb => ({
    date: pb.date,
    exercise: pb.exerciseName,
    weight: pb.weight,
    reps: pb.reps,
  }));
  files.push({ name: 'pbs.csv', data: Papa.unparse(pbRows) });

  // 3. Body Composition (includes optional VO2 Max)
  const bodyCompRows = bodyComp.map((entry: { date: string; weight: number; bodyFat: number; vo2Max?: number }) => ({
    date: entry.date,
    weight: entry.weight,
    bodyFat: entry.bodyFat,
    vo2Max: entry.vo2Max ?? '',
  }));
  files.push({ name: 'body_composition.csv', data: Papa.unparse(bodyCompRows) });

  // 4. Settings
  const settingsRows = Object.keys(settings).map(key => ({
    key,
    value: JSON.stringify(settings[key]),
  }));
  files.push({ name: 'settings.csv', data: Papa.unparse(settingsRows) });

  // Zip all CSVs into one file (optional future step)

  // Return as single CSV blob for download
  const fullCSV = files.map(f => `### ${f.name}\n${f.data}`).join('\n\n');
  return new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' });
}
