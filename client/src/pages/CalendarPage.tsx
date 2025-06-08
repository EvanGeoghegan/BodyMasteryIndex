import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { storage } from "@/lib/storage";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);

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
                  }`}
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
                  
                  {/* Consecutive rest day emoji */}
                  {isConsecutiveRest && !isTodayDate && isCurrentMonthDay && (
                    <div className="absolute top-1 right-1 text-2xl">🐌</div>
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
              <span className="text-2xl">🐌</span>
              <span className="text-text-secondary">Consecutive Rest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}