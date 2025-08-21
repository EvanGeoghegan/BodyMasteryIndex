import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';

// Use one channel for Android
const ANDROID_CHANNEL_ID = 'bmi_reminders';

// Unique IDs for the 2 repeating reminders
export const WORKOUT_REMINDER_ID   = 1111;
export const NUTRITION_REMINDER_ID = 2222;
export const ASSESSMENT_REMINDER_ID = 3333;

let listenersAdded = false;

export async function initNotifications() {

  // 2) Android channel
  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: ANDROID_CHANNEL_ID,
      name: 'Workout & Nutrition Reminders',
      description: 'Reminds you to log workouts or nutrition',
      importance: 5, // HIGH
      visibility: 1, // PUBLIC
    });
  }

  // 3) Permissions
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') {
    await LocalNotifications.requestPermissions();
  }
}

export function listenForNotificationActions(
  goToWorkout: () => void,
  goToNutrition: () => void,
  goToAssessment: () => void
) {
  if (listenersAdded) return;
  listenersAdded = true;

  LocalNotifications.addListener('localNotificationActionPerformed', (event: ActionPerformed) => {
    const page = event.notification.extra?.page as string | undefined;

    if (page === 'workout') {
      goToWorkout();
    } else if (page === 'macros') {
      goToNutrition();
    } else if (page === "assessment") {
        goToAssessment();
      }
    // else: do nothing or navigate to a default page
  });
}


// === Helpers =================================================================

/** Schedule a DAILY reminder at the given "HH:MM" string (24h). */
export async function scheduleDailyReminder(id: number, title: string, body: string, page: string, timeHHMM: string) {
  const [hourStr, minuteStr] = timeHHMM.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title,
        body,
        extra: { page },
        // Daily at HH:MM
        schedule: {
          on: { hour, minute },
          repeats: true,
          allowWhileIdle: true,
        },
        smallIcon: 'ic_bmi_notif',
        channelId: ANDROID_CHANNEL_ID,
      },
    ],
  });
}

/** Schedule the weekly assessment reminder every Sunday at 20:00 */
export async function scheduleWeeklyAssessmentReminder(
  timeHHMM: string = "20:00"
) {
  const [hourStr, minuteStr] = timeHHMM.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: ASSESSMENT_REMINDER_ID,
        title: "Weekly Assessment Ready",
        body: "Tap to view your end‑of‑week stats!",
        extra: { page: "assessment" },
        schedule: {
          // 1 = Sunday
          on: { weekday: 1, hour, minute },
          repeats: true,
          allowWhileIdle: true,
        },
        smallIcon: "ic_bmi_notif",    // your custom icon resource
        channelId: ANDROID_CHANNEL_ID,
      },
    ],
  });
}

/** Cancel a reminder by id */
export async function cancelReminder(id: number) {
  await LocalNotifications.cancel({ notifications: [{ id }] });
}
