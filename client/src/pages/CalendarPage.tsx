import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, X, Dumbbell, Clock, Minus } from "lucide-react";
import { storage } from "@/lib/storage";
import { Workout } from "@shared/schema";
import { Button } from "@/components/ui/button";

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
    
    // Add event listener for when user returns to tab
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

  // Refresh data when the refreshKey changes
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
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

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
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return dateString > todayString;
  };

  const getWorkoutData = (date: Date) => {
    // Use local timezone date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const allWorkouts = storage.getWorkouts();
    const workouts = allWorkouts.filter(w => {
      // Handle both ISO strings and date-only strings
      const workoutDateString = w.date.includes('T') ? w.date.split('T')[0] : w.date.split(' ')[0];
      return workoutDateString === dateString;
    });
    
    if (workouts.length === 0) return null;
    
    // Determine workout types for the day
    const workoutTypes = new Set(workouts.map(w => w.type));
    return {
      hasWorkouts: true,
      types: Array.from(workoutTypes),
      count: workouts.length
    };
  };

  const getConsecutiveRestDays = (date: Date) => {
    if (isFutureDate(date)) return 0;
    
    const workoutData = getWorkoutData(date);
    if (workoutData?.hasWorkouts) return 0;
    
    let consecutiveDays = 1; // Current day is a rest day
    const currentDate = new Date(date);
    
    // Count backwards to find consecutive rest days
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      const checkWorkoutData = getWorkoutData(checkDate);
      
      if (!checkWorkoutData?.hasWorkouts) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  };

  const hasMultipleMissedDays = (date: Date) => {
    return getConsecutiveRestDays(date) > 1;
  };

  const handleDateClick = (date: Date) => {
    if (isFutureDate(date)) return;
    
    // Use same date formatting as getWorkoutData
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const workouts = storage.getWorkouts();
    const dayWorkouts = workouts.filter(w => {
      const workoutDateString = w.date.includes('T') ? w.date.split('T')[0] : w.date.split(' ')[0];
      return workoutDateString === dateString;
    });
    
    setSelectedDate(date);
    setSelectedWorkouts(dayWorkouts);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedWorkouts([]);
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
      duration: workout.exercises.length * 15 // Rough estimate
    };
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20">
      <header className="bg-dark-secondary p-4 shadow-lg">
        <h2 className="text-xl font-bold text-text-primary font-heading flex items-center">
          <Calendar className="mr-2 text-accent-red" size={24} />
          Activity Calendar
        </h2>
      </header>

      <div className="p-4">
        <div className="bg-dark-secondary rounded-lg p-6 border border-dark-border">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigateMonth(-1)}
              className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-dark-elevated"
            >
              <ChevronLeft size={24} />
            </button>
            <h3 className="text-text-primary font-bold text-xl">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button 
              onClick={() => navigateMonth(1)}
              className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-dark-elevated"
            >
              <ChevronRight size={24} />
            </button>
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
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);
              const workoutData = getWorkoutData(date);
              const hasMissedDays = hasMultipleMissedDays(date);
              const isFuture = isFutureDate(date);

              // Create workout type indicators
              const getWorkoutIndicators = () => {
                if (!workoutData) return null;
                
                const indicators = [];
                if (workoutData.types.includes('strength')) {
                  indicators.push(<div key="strength" className="w-2 h-2 bg-blue-500 rounded-full" />);
                }
                if (workoutData.types.includes('cardio')) {
                  indicators.push(<div key="cardio" className="w-2 h-2 bg-green-500 rounded-full" />);
                }
                if (workoutData.types.includes('core')) {
                  indicators.push(<div key="core" className="w-2 h-2 bg-yellow-500 rounded-full" />);
                }
                if (workoutData.types.includes('mixed')) {
                  indicators.push(<div key="mixed" className="w-2 h-2 bg-purple-500 rounded-full" />);
                }
                
                return (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {indicators}
                  </div>
                );
              };

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`h-16 flex flex-col items-center justify-center text-lg rounded-lg cursor-pointer relative transition-all duration-200 border-2 ${
                    isTodayDate
                      ? 'bg-accent-navy text-white font-bold shadow-lg border-accent-navy'
                      : hasMissedDays && isCurrentMonthDay && !isFuture
                      ? 'bg-dark-elevated text-text-primary hover:bg-dark-primary border-red-500'
                      : workoutData && isCurrentMonthDay && !isFuture
                      ? 'bg-dark-elevated text-text-primary hover:bg-dark-primary border-dark-border'
                      : isCurrentMonthDay
                      ? 'bg-dark-elevated text-text-primary hover:bg-dark-primary border-dark-border'
                      : 'bg-dark-primary text-text-disabled border-dark-border'
                  } ${!isFuture && isCurrentMonthDay ? 'hover:scale-105' : ''}`}
                >
                  <span className="z-10 text-center">{date.getDate()}</span>
                  {getWorkoutIndicators()}
                </div>
              );
            })}
          </div>
          
          {/* Calendar Legend */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-dark-border">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-accent-navy rounded-lg border-2 border-accent-navy"></div>
              <span className="text-text-secondary">Today</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-dark-elevated rounded-lg border-2 border-red-500"></div>
              <span className="text-text-secondary">Rest Days</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-text-secondary">Strength/Gym</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-text-secondary">Cardio</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-text-secondary">Core</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-text-secondary">Mixed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-secondary rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto border border-dark-border shadow-2xl">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <Button
                onClick={closeModal}
                variant="ghost"
                size="sm"
                className="text-text-secondary hover:text-text-primary p-1"
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="p-4">
              {selectedWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {selectedWorkouts.map((workout, workoutIndex) => {
                    const summary = formatWorkoutSummary(workout);
                    return (
                      <div key={workoutIndex} className="space-y-4">
                        {selectedWorkouts.length > 1 && (
                          <div className="text-sm text-text-secondary font-medium border-b border-dark-border pb-2">
                            Workout {workoutIndex + 1}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3">
                          <Dumbbell className="text-accent-navy" size={20} />
                          <div>
                            <h4 className="font-semibold text-text-primary">{workout.name}</h4>
                            <p className="text-text-secondary text-sm">
                              {`${summary.exercises} exercises • ${summary.completedSets} sets • ${summary.totalVolume}kg volume`}
                            </p>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-dark-elevated rounded-lg p-3 text-center border border-dark-border">
                            <div className="text-lg font-bold text-accent-navy">
                              {summary.exercises}
                            </div>
                            <div className="text-xs text-text-secondary">Exercises</div>
                          </div>
                          <div className="bg-dark-elevated rounded-lg p-3 text-center border border-dark-border">
                            <div className="text-lg font-bold text-accent-green">
                              {summary.completedSets}
                            </div>
                            <div className="text-xs text-text-secondary">Sets</div>
                          </div>
                          <div className="bg-dark-elevated rounded-lg p-3 text-center border border-dark-border">
                            <div className="text-lg font-bold text-accent-light-navy">
                              {summary.totalVolume}kg
                            </div>
                            <div className="text-xs text-text-secondary">Volume</div>
                          </div>
                        </div>

                        {/* Exercise List */}
                        <div>
                          <h5 className="font-medium text-text-primary mb-3">Exercises Completed</h5>
                          <div className="space-y-2">
                            {workout.exercises.map((exercise, index) => {
                              const completedSets = exercise.sets.filter(set => set.completed);
                              if (completedSets.length === 0) return null;
                              
                              return (
                                <div key={index} className="bg-dark-elevated rounded-lg p-3 border border-dark-border">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-text-primary">{exercise.name}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      exercise.type === 'cardio' 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : exercise.type === 'core'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                      {exercise.type}
                                    </span>
                                  </div>
                                  <div className="mt-2 text-sm text-text-secondary">
                                    {exercise.type === 'cardio' ? (
                                      <div className="flex space-x-4">
                                        {completedSets[0]?.duration && (
                                          <span>{completedSets[0].duration} min</span>
                                        )}
                                        {completedSets[0]?.distance && (
                                          <span>{completedSets[0].distance} km</span>
                                        )}
                                        {completedSets[0]?.steps && (
                                          <span>{completedSets[0].steps} steps</span>
                                        )}
                                      </div>
                                    ) : exercise.type === 'core' ? (
                                      <span>
                                        {completedSets.length} sets completed
                                      </span>
                                    ) : (
                                      <span>
                                        {completedSets.length} sets • Best: {
                                          Math.max(...completedSets.map(set => set.weight || 0))
                                        }kg × {
                                          completedSets.find(set => set.weight === Math.max(...completedSets.map(s => s.weight || 0)))?.reps || 0
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {workout.notes && (
                          <div className="bg-dark-elevated rounded-lg p-3 border border-dark-border">
                            <h5 className="font-medium text-text-primary mb-2">Workout Notes</h5>
                            <p className="text-text-secondary text-sm">{workout.notes}</p>
                          </div>
                        )}
                        
                        {workoutIndex < selectedWorkouts.length - 1 && (
                          <div className="border-b border-dark-border"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto text-text-disabled mb-4" size={48} />
                  <p className="text-text-secondary mb-2">No workout logged</p>
                  <p className="text-text-disabled text-sm">
                    This was a rest day
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}