import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, X, Dumbbell, Clock, Pill } from "lucide-react";
import { storage } from "@/lib/storage";
import { Workout, SupplementLog } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSupplements, setSelectedSupplements] = useState<SupplementLog[]>([]);

  useEffect(() => {
    const refreshData = () => {
      setWorkoutDays(storage.getWorkoutDays());
      setRefreshKey(prev => prev + 1);
    };

    refreshData();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    setWorkoutDays(storage.getWorkoutDays());
  }, [refreshKey]);

  const today = new Date();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const days = [];
  const endDate = new Date(lastDayOfMonth);
  if (endDate.getDay() !== 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  }

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    days.push(new Date(date));
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  // --- DEFINITIVE FIX: Compare date components, not the whole object ---
  const isToday = (date: Date) => {
    const todayDate = new Date();
    return date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear();
  };
  // --- END FIX ---

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const isFutureDate = (date: Date) => {
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateNormalized > todayNormalized;
  };

  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWorkoutData = (date: Date) => {
    const dateString = toLocalDateString(date);
    const allWorkouts = storage.getWorkouts();
    const workouts = allWorkouts.filter(w => w.date.startsWith(dateString));

    if (workouts.length === 0) return null;

    const workoutTypes = new Set(workouts.map(w => w.type));
    return {
      hasWorkouts: true,
      types: Array.from(workoutTypes),
    };
  };

  const getSupplementLogStatus = (date: Date) => {
    const dateString = toLocalDateString(date);
    const logs = storage.getSupplementLogs(dateString);
    return logs.some(log => log.taken);
  };

  const handleDateClick = (date: Date) => {
    if (isFutureDate(date)) return;

    const dateString = toLocalDateString(date);
    const workouts = storage.getWorkouts().filter(w => w.date.startsWith(dateString));
    const logs = storage.getSupplementLogs(dateString);
    const takenSupplements = logs.filter(log => log.taken && log.supplementId);
    setSelectedSupplements(takenSupplements);

    setSelectedDate(date);
    setSelectedWorkouts(workouts);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedWorkouts([]);
    setSelectedSupplements([]);
  };

  const formatWorkoutSummary = (workout: Workout) => {
    const completedSets = workout.exercises.reduce((acc, ex) =>
      acc + ex.sets.filter(set => set.completed).length, 0
    );
    const totalVolume = workout.exercises.reduce((vol, ex) =>
      vol + ex.sets.reduce((setVol, set) =>
        set.completed && set.weight && set.reps ? setVol + (set.weight * set.reps) : setVol, 0
      ), 0
    );

    return {
      exercises: workout.exercises.length,
      completedSets,
      totalVolume: Math.round(totalVolume),
    };
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      <header className="bg-dark-secondary p-2 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left side: Page Icon + Title */}
          <div className="flex items-center">
            <Calendar className="text-accent-red mr-4" size={28} />
            <div>
              <h2 className="text-xl font-bold text-text-primary font-heading">
                Activity Calendar
              </h2>
              <p className="text-text-secondary mt-1">Review your workout history.</p>
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

      <div className="p-4">
        <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button onClick={() => navigateMonth(-1)} variant="ghost" size="icon">
              <ChevronLeft size={24} />
            </Button>
            <h3 className="text-text-primary font-bold text-xl">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <Button onClick={() => navigateMonth(1)} variant="ghost" size="icon">
              <ChevronRight size={24} />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center text-text-disabled text-sm py-3 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const workoutData = getWorkoutData(date);
              const supplementsTaken = getSupplementLogStatus(date);
              const isFuture = isFutureDate(date);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "h-16 flex flex-col items-center justify-center text-lg rounded-lg cursor-pointer relative transition-all duration-200 border-2",
                    {
                      "opacity-50": !isCurrentMonth(date),
                      "hover:scale-105 hover:border-accent-red": !isFuture,
                      "cursor-not-allowed": isFuture,
                      "bg-accent-red text-white font-bold border-accent-red": isToday(date),
                      "bg-dark-elevated text-text-primary border-transparent": !isToday(date),
                      "border-red-500/50": !workoutData && !supplementsTaken && !isFuture && !isToday(date) && isCurrentMonth(date)
                    }
                  )}
                >
                  <span className="z-10 text-center text-sm">{date.getDate()}</span>

                  <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1">
                    <div className="flex gap-1">
                      {workoutData?.types.includes('strength') && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
                      {workoutData?.types.includes('cardio') && <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />}
                      {workoutData?.types.includes('core') && <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
                    </div>
                    {supplementsTaken && <div className="w-1.5 h-1.5 bg-white rounded-full supplement-dot" />}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-8 pt-6 border-t border-dark-border">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-accent-red rounded-md border-2 border-accent-red"></div>
              <span className="text-text-secondary text-sm">Today</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-dark-elevated rounded-md border-2 border-red-500/50"></div>
              <span className="text-text-secondary text-sm">Rest Day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-text-secondary text-sm">Strength</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-text-secondary text-sm">Cardio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-text-secondary text-sm">Core</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-text-secondary text-sm">Supplements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-secondary rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto border border-dark-border shadow-2xl">
            <div className="p-4 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-secondary z-10">
              <h3 className="text-lg font-bold text-text-primary">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <Button onClick={closeModal} variant="ghost" size="icon" className="text-text-secondary hover:text-text-primary">
                <X size={20} />
              </Button>
            </div>

            <div className="p-4">
              {selectedWorkouts.length > 0 || selectedSupplements.length > 0 ? (
                <div className="space-y-6">
                  {/* Workouts Section */}
                  {selectedWorkouts.length > 0 && (
                    <div>
                      {selectedWorkouts.map((workout) => (
                        <div key={workout.id} className="bg-dark-elevated p-4 rounded-lg border border-dark-border mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-text-primary">{workout.name}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-accent-red/10 text-accent-red font-medium capitalize">{workout.type}</span>
                          </div>
                          <div className="space-y-2">
                            {workout.exercises.map((exercise, index) => (
                              <div key={index} className="text-sm text-text-secondary border-t border-dark-border pt-2 first:border-t-0 first:pt-0">
                                <span className="font-medium text-text-primary">{exercise.name}</span> - {exercise.sets.filter(s => s.completed).length} sets
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Supplements Section */}
                  {selectedSupplements.length > 0 && (
                    <div className="pt-4 border-t border-dark-border">
                      <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                        <Pill className="mr-2 text-accent-green" size={18} />
                        Supplements Logged
                      </h4>
                      <ul className="space-y-2 text-text-secondary">
                        {selectedSupplements.map(log => (
                          <li key={log.id} className="bg-dark-elevated p-2 rounded-md text-sm">
                            {storage.getSupplementById(log.supplementId)?.name || 'Unknown Supplement'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto text-text-disabled mb-4" size={48} />
                  <p className="text-text-secondary mb-2">No Activity Logged</p>
                  <p className="text-text-disabled text-sm">This was a rest day.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
