import Storage from 'expo-sqlite/kv-store';

const KEY_NOTIFICATIONS_ENABLED = 'notificationsEnabled';
const KEY_REMINDER_DAYS = 'reminderDaysBefore';
const KEY_NOTIFICATION_HOUR = 'notificationHour';
const KEY_NOTIFICATION_MINUTE = 'notificationMinute';

export interface AppSettings {
  notificationsEnabled: boolean;
  reminderDaysBefore: number;
  notificationHour: number;
  notificationMinute: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  reminderDaysBefore: 3,
  notificationHour: 9,
  notificationMinute: 0,
};

export async function getSettings(): Promise<AppSettings> {
  const [enabledRaw, daysRaw, hourRaw, minuteRaw] = await Promise.all([
    Storage.getItem(KEY_NOTIFICATIONS_ENABLED),
    Storage.getItem(KEY_REMINDER_DAYS),
    Storage.getItem(KEY_NOTIFICATION_HOUR),
    Storage.getItem(KEY_NOTIFICATION_MINUTE),
  ]);
  return {
    notificationsEnabled: enabledRaw === null ? DEFAULT_SETTINGS.notificationsEnabled : enabledRaw === 'true',
    reminderDaysBefore: daysRaw === null ? DEFAULT_SETTINGS.reminderDaysBefore : parseInt(daysRaw, 10),
    notificationHour: hourRaw === null ? DEFAULT_SETTINGS.notificationHour : parseInt(hourRaw, 10),
    notificationMinute: minuteRaw === null ? DEFAULT_SETTINGS.notificationMinute : parseInt(minuteRaw, 10),
  };
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await Storage.setItem(KEY_NOTIFICATIONS_ENABLED, String(enabled));
}

export async function setReminderDaysBefore(days: number): Promise<void> {
  await Storage.setItem(KEY_REMINDER_DAYS, String(days));
}

export async function setNotificationTime(hour: number, minute: number): Promise<void> {
  await Promise.all([
    Storage.setItem(KEY_NOTIFICATION_HOUR, String(hour)),
    Storage.setItem(KEY_NOTIFICATION_MINUTE, String(minute)),
  ]);
}
