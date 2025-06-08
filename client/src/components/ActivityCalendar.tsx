import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Minus } from "lucide-react";

interface ActivityCalendarProps {
  workoutDays: string[];
}

export default function ActivityCalendar({ workoutDays }: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const hasWorkout = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return workoutDays.includes(dateString);
  };

  const isConsecutiveRestDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevDayString = prevDay.toISOString().split('T')[0];
    
    return !hasWorkout(date) && !workoutDays.includes(prevDayString);
  };

  return (
    <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
        <Calendar className="text-accent-green mr-2" size={20} />
        Activity Calendar
      </h3>
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigateMonth(-1)}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h4 className="text-text-primary font-medium">
          {monthNames[currentMonth]} {currentYear}
        </h4>
        <button 
          onClick={() => navigateMonth(1)}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-text-disabled text-xs py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const hasWorkoutDay = hasWorkout(date);
          const isConsecutiveRest = isConsecutiveRestDay(date);

          return (
            <div
              key={index}
              className={`h-8 flex items-center justify-center text-sm rounded cursor-pointer relative transition-colors ${
                isTodayDate
                  ? 'bg-accent-navy text-white font-semibold'
                  : hasWorkoutDay && isCurrentMonthDay
                  ? 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30'
                  : !hasWorkoutDay && isCurrentMonthDay
                  ? 'bg-accent-red/10 text-accent-red hover:bg-accent-red/20'
                  : isCurrentMonthDay
                  ? 'text-text-primary hover:bg-dark-elevated'
                  : 'text-text-disabled'
              }`}
            >
              {date.getDate()}
              {hasWorkoutDay && !isTodayDate && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-accent-green rounded-full"></div>
              )}
              {!hasWorkoutDay && !isTodayDate && isCurrentMonthDay && !isConsecutiveRest && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full"></div>
              )}
              {isConsecutiveRest && !isTodayDate && isCurrentMonthDay && (
                <div className="absolute top-1 right-1 text-accent-red">🐌</div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Calendar Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-dark-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-accent-navy rounded-full"></div>
          <span className="text-text-secondary text-sm">Today</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent-green rounded-full"></div>
          <span className="text-text-secondary text-sm">Workout</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent-red rounded-full"></div>
          <span className="text-text-secondary text-sm">Rest Day</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-accent-red">🐌</span>
          <span className="text-text-secondary text-sm">Consecutive Rest</span>
        </div>
      </div>
    </div>
  );
}
