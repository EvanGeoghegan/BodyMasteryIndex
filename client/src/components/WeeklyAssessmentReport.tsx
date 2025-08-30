import React, { useMemo } from 'react';
import { storage } from '@/lib/storage';
import { Workout, PersonalBest } from '@shared/schema';
import { Calendar, Dumbbell, Trophy } from 'lucide-react';

export default function WeeklyAssessmentReport() {
  const now = new Date();
  // Start of week = last Sunday at 00:00
  const startOfWeek = useMemo(() => {
    const d = new Date(now);
    d.setDate(now.getDate() - now.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);

  // Pull everything from localStorage
  const allWorkouts: Workout[] = storage.getWorkouts();
  const allPBs: PersonalBest[]  = storage.getPersonalBests();

  // Filter down to this week
  const weeklyWorkouts = allWorkouts.filter(w => new Date(w.date) >= startOfWeek);
  const weeklyPBs      = allPBs.filter(pb   => new Date(pb.date)  >= startOfWeek);

  // 1) Total workouts
  const totalWorkouts = weeklyWorkouts.length;

  // 2) Total volume (weight×reps)
  const totalVolume = weeklyWorkouts.reduce((sum, w) =>
    sum + w.exercises.reduce((exSum, ex) =>
      exSum + ex.sets.reduce((setSum, set) =>
        setSum + (set.completed && set.weight && set.reps
          ? set.weight * set.reps
          : 0
        ),
      0),
    0),
  0);

  // Date range label
  const rangeStr = `${startOfWeek.toLocaleDateString()} – ${now.toLocaleDateString()}`;

  return (
    <div className="bg-dark-primary pb-20">
      <header className="bg-dark-secondary p-4 border-b border-dark-border">
        <h2 className="text-xl font-bold text-text-primary">Weekly Assessment</h2>
        <p className="text-text-secondary mt-1">Summary for {rangeStr}</p>
      </header>

      <div className="p-4 grid grid-cols-3 gap-4">
        {/* Workouts */}
        <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border text-center">
          <Calendar className="mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold text-accent-red">{totalWorkouts}</p>
          <p className="text-xs text-text-secondary">Workouts</p>
        </div>

        {/* Volume */}
        <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border text-center">
          <Dumbbell className="mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold text-accent-red">{(totalVolume / 1000).toFixed(1)}k</p>
          <p className="text-xs text-text-secondary">Volume (kg)</p>
        </div>

        {/* New PBs */}
        <div className="bg-dark-secondary rounded-xl p-4 border border-dark-border text-center">
          <Trophy className="mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold text-accent-red">{weeklyPBs.length}</p>
          <p className="text-xs text-text-secondary">New PBs</p>
        </div>
      </div>

      {weeklyPBs.length > 0 ? (
        <section className="p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-2">New Personal Bests</h3>
          <ul className="space-y-2">
            {weeklyPBs.map(pb => {
              const oneRepMax = Math.round(pb.weight * (1 + pb.reps / 30));
              return (
                <li key={pb.id} className="bg-dark-secondary rounded-lg p-3 border border-dark-border">
                  <p className="font-medium text-text-primary">{pb.exerciseName}</p>
                  <p className="text-xs text-text-secondary">
                    1RM: {oneRepMax} on {new Date(pb.date).toLocaleDateString()}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="p-4">
          <p className="text-text-secondary">No new personal bests this week. Keep it up!</p>
        </section>
      )}
    </div>
  );
}
