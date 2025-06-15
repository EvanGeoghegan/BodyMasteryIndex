import { useState, useEffect } from "react";
import { Bell, X, Dumbbell, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'workout' | 'nutrition';
  timestamp: Date;
}

interface NotificationSystemProps {
  onNavigateToWorkout: () => void;
  onNavigateToNutrition: () => void;
}

export default function NotificationSystem({ onNavigateToWorkout, onNavigateToNutrition }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const checkForNotifications = () => {
      const settings = JSON.parse(localStorage.getItem('bmi_settings') || '{}');
      const workoutReminderEnabled = settings.workoutReminder !== false;
      const nutritionReminderEnabled = settings.nutritionReminder !== false;
      const workoutReminderTime = settings.workoutReminderTime || '18:00';
      const nutritionReminderTime = settings.nutritionReminderTime || '20:00';

      if (!workoutReminderEnabled && !nutritionReminderEnabled) return;

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = now.toDateString();

      // Check if we've already shown notifications today
      const lastNotificationDate = localStorage.getItem('bmi_last_notification_date');
      const workoutNotificationShown = localStorage.getItem('bmi_workout_notification_shown') === today;
      const nutritionNotificationShown = localStorage.getItem('bmi_nutrition_notification_shown') === today;

      const newNotifications: Notification[] = [];

      // Check for workout reminder
      if (workoutReminderEnabled && !workoutNotificationShown && currentTime >= workoutReminderTime) {
        const hasWorkoutToday = checkHasWorkoutToday();
        if (!hasWorkoutToday) {
          newNotifications.push({
            id: `workout-${Date.now()}`,
            title: "Time to Work Out!",
            message: "Don't forget to log your workout today. Your consistency matters!",
            type: 'workout',
            timestamp: now
          });
          localStorage.setItem('bmi_workout_notification_shown', today);
        }
      }

      // Check for nutrition reminder
      if (nutritionReminderEnabled && !nutritionNotificationShown && currentTime >= nutritionReminderTime) {
        const hasNutritionToday = checkHasNutritionToday();
        if (!hasNutritionToday) {
          newNotifications.push({
            id: `nutrition-${Date.now()}`,
            title: "Log Your Nutrition",
            message: "Remember to track your protein and water intake for today!",
            type: 'nutrition',
            timestamp: now
          });
          localStorage.setItem('bmi_nutrition_notification_shown', today);
        }
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...prev, ...newNotifications]);
        // Show notification permission request if not already granted
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
        // Send browser notification if permission granted
        if (Notification.permission === 'granted') {
          newNotifications.forEach(notification => {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico'
            });
          });
        }
      }
    };

    const checkHasWorkoutToday = (): boolean => {
      const workouts = JSON.parse(localStorage.getItem('bmi_workouts') || '[]');
      const today = new Date().toDateString();
      return workouts.some((workout: any) => new Date(workout.date).toDateString() === today);
    };

    const checkHasNutritionToday = (): boolean => {
      const today = new Date().toISOString().split('T')[0];
      const proteinLog = JSON.parse(localStorage.getItem('bmi_protein_log') || '{}');
      const waterLog = JSON.parse(localStorage.getItem('bmi_water_log') || '{}');
      return proteinLog[today] > 0 || waterLog[today] > 0;
    };

    // Check immediately and then every minute
    checkForNotifications();
    const interval = setInterval(checkForNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'workout') {
      onNavigateToWorkout();
    } else if (notification.type === 'nutrition') {
      onNavigateToNutrition();
    }
    dismissNotification(notification.id);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-dark-secondary border border-dark-border rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {notification.type === 'workout' ? (
                <Dumbbell className="text-accent-red" size={20} />
              ) : (
                <Apple className="text-green-500" size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-primary mb-1">
                {notification.title}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {notification.message}
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => handleNotificationClick(notification)}
                  size="sm"
                  className="bg-accent-red hover:bg-accent-red/90 text-white text-xs h-7 px-3"
                >
                  {notification.type === 'workout' ? 'Log Workout' : 'Log Nutrition'}
                </Button>
                <Button
                  onClick={() => dismissNotification(notification.id)}
                  size="sm"
                  variant="ghost"
                  className="text-text-secondary hover:text-text-primary text-xs h-7 px-3"
                >
                  Later
                </Button>
              </div>
            </div>
            <Button
              onClick={() => dismissNotification(notification.id)}
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-text-secondary hover:text-text-primary"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}