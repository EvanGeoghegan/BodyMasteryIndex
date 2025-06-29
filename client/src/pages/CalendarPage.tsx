import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, X, Dumbbell } from "lucide-react";
import { storage } from "@/lib/storage";
import { Workout } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Import the cn utility

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

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
  today.setHours(0, 0, 0, 0);
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

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const isFutureDate = (date: Date) => {
    return date > today;
  };

  const getWorkoutData = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const allWorkouts = storage.getWorkouts();
    const workouts = allWorkouts.filter(w => w.date.startsWith(dateString));
    
    if (workouts.length === 0) return null;
    
    const workoutTypes = new Set(workouts.map(w => w.type));
    return {
      hasWorkouts: true,
      types: Array.from(workoutTypes),
    };
  };

  const handleDateClick = (date: Date) => {
    if (isFutureDate(date)) return;
    
    const dateString = date.toISOString().split('T')[0];
    const workouts = storage.getWorkouts().filter(w => w.date.startsWith(dateString));
    
    setSelectedDate(date);
    setSelectedWorkouts(workouts);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedWorkouts([]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-text-primary font-heading flex items-center">
          <Calendar className="mr-2 text-primary-accent" size={24} />
          Activity Calendar
        </h2>
      </header>

      <div className="p-4">
        <div className="bg-card rounded-xl p-6 border border-border">
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
              const isFuture = isFutureDate(date);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  // --- THIS IS THE UPDATED PART ---
                  className={cn(
                    "h-16 flex flex-col items-center justify-center text-lg relative transition-all duration-200 border-2 calendar-day",
                    {
                      "opacity-50": !isCurrentMonth(date),
                      "cursor-pointer hover:scale-105 hover:border-primary-accent": !isFuture,
                      "cursor-not-allowed": isFuture,
                      "calendar-day-today": isToday(date), // Applies the new class for today
                      "bg-card-elevated text-text-primary border-transparent": !isToday(date),
                      "border-red-500/50": !workoutData && !isFuture && !isToday(date) && isCurrentMonth(date)
                    }
                  )}
                  // --- END OF UPDATE ---
                >
                  <span className="z-10 text-center text-sm">{date.getDate()}</span>
                  {workoutData && (
                     <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {workoutData.types.includes('strength') && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                        {workoutData.types.includes('cardio') && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                        {workoutData.types.includes('core') && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />}
                     </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Calendar Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-8 pt-6 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-md border-2 border-primary-accent bg-primary-accent"></div>
              <span className="text-text-secondary text-sm">Today</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-card-elevated rounded-md border-2 border-red-500/50"></div>
              <span className="text-text-secondary text-sm">Rest Day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-text-secondary text-sm">Strength</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-text-secondary text-sm">Cardio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-text-secondary text-sm">Core</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto border border-border shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="text-lg font-bold text-text-primary">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <Button onClick={closeModal} variant="ghost" size="icon" className="text-text-secondary hover:text-text-primary">
                <X size={20} />
              </Button>
            </div>
            
            <div className="p-4">
              {selectedWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {selectedWorkouts.map((workout, workoutIndex) => (
                      <div key={workout.id} className="bg-card-elevated p-4 rounded-lg border border-border">
                         <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-text-primary">{workout.name}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-primary-accent/10 text-primary-accent font-medium">{workout.type}</span>
                         </div>
                        
                        <div className="space-y-2">
                            {workout.exercises.map((exercise, index) => (
                                <div key={index} className="text-sm text-text-secondary border-t border-border pt-2">
                                    <span className="font-medium text-text-primary">{exercise.name}</span> - {exercise.sets.filter(s => s.completed).length} sets
                                </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto text-text-disabled mb-4" size={48} />
                  <p className="text-text-secondary mb-2">No workout logged</p>
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
