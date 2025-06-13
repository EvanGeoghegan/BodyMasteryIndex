import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, X, Dumbbell, Clock, Minus } from "lucide-react";
import { storage } from "@/lib/storage";
import { Workout } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    setWorkoutDays(storage.getWorkoutDays());
  }, []);

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
    return date > today;
  };

  const hasWorkout = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return workoutDays.includes(dateString);
  };

  const isConsecutiveRestDay = (date: Date) => {
    if (isFutureDate(date)) return false;
    
    const dateString = date.toISOString().split('T')[0];
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevDayString = prevDay.toISOString().split('T')[0];
    
    return !hasWorkout(date) && !workoutDays.includes(prevDayString);
  };

  const handleDateClick = (date: Date) => {
    if (isFutureDate(date)) return;
    
    const dateString = date.toISOString().split('T')[0];
    const workouts = storage.getWorkouts();
    const workout = workouts.find(w => w.date.startsWith(dateString));
    
    setSelectedDate(date);
    setSelectedWorkout(workout || null);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedWorkout(null);
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
        <h2 className="text-xl font-bold text-text-primary flex items-center">
          <Calendar className="mr-2 text-accent-navy" size={24} />
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
              const hasWorkoutDay = hasWorkout(date);
              const isConsecutiveRest = isConsecutiveRestDay(date);
              const isFuture = isFutureDate(date);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`h-16 flex items-center justify-center text-lg rounded-lg cursor-pointer relative transition-all duration-200 ${
                    isTodayDate
                      ? 'bg-accent-navy text-white font-bold shadow-lg'
                      : hasWorkoutDay && isCurrentMonthDay && !isFuture
                      ? 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30 font-semibold'
                      : !hasWorkoutDay && isCurrentMonthDay && !isFuture && !isConsecutiveRest
                      ? 'bg-accent-red/10 text-accent-red hover:bg-accent-red/20'
                      : isCurrentMonthDay
                      ? 'text-text-primary hover:bg-dark-elevated'
                      : 'text-text-disabled'
                  } ${!isFuture && isCurrentMonthDay ? 'hover:scale-105' : ''}`}
                >
                  <span className="z-10">{date.getDate()}</span>
                  
                  {/* Workout indicator */}
                  {hasWorkoutDay && !isTodayDate && !isFuture && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-accent-green rounded-full shadow-sm"></div>
                  )}
                  
                  {/* Single rest day indicator */}
                  {!hasWorkoutDay && !isTodayDate && isCurrentMonthDay && !isConsecutiveRest && !isFuture && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-accent-red rounded-full shadow-sm"></div>
                  )}
                  
                  {/* Consecutive rest day icon */}
                  {isConsecutiveRest && !isTodayDate && isCurrentMonthDay && (
                    <div className="absolute top-1 right-1 p-1 bg-text-disabled/20 rounded-full">
                      <Minus className="text-text-disabled" size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Calendar Legend */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-dark-border">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-accent-navy rounded-full"></div>
              <span className="text-text-secondary">Today</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-accent-green rounded-full"></div>
              <span className="text-text-secondary">Workout Day</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-accent-red rounded-full"></div>
              <span className="text-text-secondary">Rest Day</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-text-disabled/20 rounded-full">
                <Minus className="text-text-disabled" size={12} />
              </div>
              <span className="text-text-secondary">Consecutive Rest</span>
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
              {selectedWorkout ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Dumbbell className="text-accent-navy" size={20} />
                    <div>
                      <h4 className="font-semibold text-text-primary">{selectedWorkout.name}</h4>
                      <p className="text-text-secondary text-sm">
                        {(() => {
                          const summary = formatWorkoutSummary(selectedWorkout);
                          return `${summary.exercises} exercises • ${summary.completedSets} sets • ${summary.totalVolume}kg volume`;
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-dark-elevated rounded-lg p-3 text-center border border-dark-border">
                      <div className="text-lg font-bold text-accent-navy">
                        {formatWorkoutSummary(selectedWorkout).exercises}
                      </div>
                      <div className="text-xs text-text-secondary">Exercises</div>
                    </div>
                    <div className="bg-dark-elevated rounded-lg p-3 text-center border border-dark-border">
                      <div className="text-lg font-bold text-accent-green">
                        {formatWorkoutSummary(selectedWorkout).completedSets}
                      </div>
                      <div className="text-xs text-text-secondary">Sets</div>
                    </div>
                    <div className="bg-dark-elevated rounded-lg p-3 text-center border border-dark-border">
                      <div className="text-lg font-bold text-accent-light-navy">
                        {formatWorkoutSummary(selectedWorkout).totalVolume}kg
                      </div>
                      <div className="text-xs text-text-secondary">Volume</div>
                    </div>
                  </div>

                  {/* Exercise List */}
                  <div>
                    <h5 className="font-medium text-text-primary mb-3">Exercises Completed</h5>
                    <div className="space-y-2">
                      {selectedWorkout.exercises.map((exercise, index) => {
                        const completedSets = exercise.sets.filter(set => set.completed);
                        if (completedSets.length === 0) return null;
                        
                        return (
                          <div key={index} className="bg-dark-elevated rounded-lg p-3 border border-dark-border">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-text-primary">{exercise.name}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                exercise.type === 'cardio' 
                                  ? 'bg-accent-navy/20 text-accent-navy' 
                                  : 'bg-accent-green/20 text-accent-green'
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
                  
                  {selectedWorkout.notes && (
                    <div className="bg-dark-elevated rounded-lg p-3 border border-dark-border">
                      <h5 className="font-medium text-text-primary mb-2">Workout Notes</h5>
                      <p className="text-text-secondary text-sm">{selectedWorkout.notes}</p>
                    </div>
                  )}
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