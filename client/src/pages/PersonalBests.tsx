import { useState, useEffect } from "react";
import { Trophy, TrendingUp } from "lucide-react";
import { storage } from "@/lib/storage";
import { PersonalBest } from "@shared/schema";

export default function PersonalBests() {
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);

  useEffect(() => {
    loadPersonalBests();
  }, []);

  const loadPersonalBests = () => {
    const allBests = storage.getPersonalBests();
    
    // Group by exercise name and get the best for each
    const bestsByExercise = allBests.reduce((acc, pb) => {
      const exerciseName = pb.exerciseName.toLowerCase();
      
      if (!acc[exerciseName] || pb.weight > acc[exerciseName].weight) {
        acc[exerciseName] = pb;
      }
      
      return acc;
    }, {} as Record<string, PersonalBest>);

    setPersonalBests(Object.values(bestsByExercise).sort((a, b) => b.weight - a.weight));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'chest':
        return '🏋️';
      case 'back':
        return '💪';
      case 'legs':
        return '🦵';
      case 'shoulders':
        return '🏆';
      default:
        return '💪';
    }
  };

  // Calculate predicted 1RM using Epley formula: weight × (1 + reps/30)
  const calculate1RM = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  // Calculate predicted weight for target reps using reverse Epley formula
  const calculateRepMax = (oneRM: number, targetReps: number): number => {
    if (targetReps === 1) return oneRM;
    return Math.round(oneRM / (1 + targetReps / 30));
  };

  const getPredictedMaxes = (pb: PersonalBest) => {
    const oneRM = calculate1RM(pb.weight, pb.reps);
    return {
      oneRM,
      sixRM: calculateRepMax(oneRM, 6),
      tenRM: calculateRepMax(oneRM, 10)
    };
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      <header className="bg-dark-secondary p-4 shadow-lg">
        <h2 className="text-xl font-bold text-text-primary font-heading flex items-center">
          <Trophy className="mr-2 text-accent-red" size={24} />
          Personal Bests
        </h2>
      </header>

      <div className="p-4 space-y-4">
        {personalBests.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="mx-auto text-text-disabled mb-4" size={48} />
            <p className="text-text-secondary mb-2">No personal bests recorded yet</p>
            <p className="text-text-disabled text-sm">
              Complete some workouts to start tracking your progress!
            </p>
          </div>
        ) : (
          personalBests.map((pb, index) => (
            <div key={pb.id} className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(pb.category)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary font-heading">
                      {pb.exerciseName}
                    </h3>
                    {pb.category && (
                      <p className="text-text-secondary text-sm">{pb.category}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent-red">
                    {pb.weight} kg
                  </div>
                  <p className="text-text-secondary text-sm">
                    {formatDate(pb.date)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 border-t border-dark-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm font-medium">Predicted Rep Maxes</span>
                  <span className="text-text-disabled text-xs">Based on {pb.weight}kg × {pb.reps}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    const maxes = getPredictedMaxes(pb);
                    return (
                      <>
                        <div className="bg-dark-elevated rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-accent-navy">{maxes.oneRM}</div>
                          <div className="text-xs text-text-secondary">1RM</div>
                        </div>
                        <div className="bg-dark-elevated rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-accent-light-navy">{maxes.sixRM}</div>
                          <div className="text-xs text-text-secondary">6RM</div>
                        </div>
                        <div className="bg-dark-elevated rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-text-secondary">{maxes.tenRM}</div>
                          <div className="text-xs text-text-secondary">10RM</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                {index === 0 && (
                  <div className="mt-3 flex justify-center">
                    <span className="bg-accent-navy text-white px-3 py-1 rounded-full text-xs font-medium">
                      Strongest Lift
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
