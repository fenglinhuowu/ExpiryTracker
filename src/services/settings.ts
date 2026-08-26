import Storage from 'expo-sqlite/kv-store';

const KEY_NOTIFICATIONS_ENABLED = 'notificationsEnabled';
const KEY_REMINDER_DAYS = 'reminderDaysBefore';

export interface AppSettings {
  notificationsEnabled: boolean;
  reminderDaysBefore: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  reminderDaysBefore: 3,
};

export async function getSettings(): Promise<AppSettings> {
  const [enabledRaw, daysRaw] = await Promise.all([
    Storage.getItem(KEY_NOTIFICATIONS_ENABLED),
    Storage.getItem(KEY_REMINDER_DAYS),
  ]);
  return {
    notificationsEnabled: enabledRaw === null ? DEFAULT_SETTINGS.notificationsEnabled : enabledRaw === 'true',
    reminderDaysBefore: daysRaw === null ? DEFAULT_SETTINGS.reminderDaysBefore : parseInt(daysRaw, 10),
  };
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await Storage.setItem(KEY_NOTIFICATIONS_ENABLED, String(enabled));
}

export async function setReminderDaysBefore(days: number): Promise<void> {
  await Storage.setItem(KEY_REMINDER_DAYS, String(days));
}
