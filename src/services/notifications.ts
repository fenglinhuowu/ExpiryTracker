import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getAllItems } from './db';
import { getSettings } from './settings';
import { daysUntil } from '../utils/date';

const DAILY_CHECK_IDENTIFIER = 'daily-expiry-check';
const CHANNEL_ID = 'expiry-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '过期提醒',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/**
 * Recomputes how many items are expiring soon and (re)schedules the single
 * daily 09:00 reminder with up-to-date content. Should be called whenever
 * items change, settings change, or the app starts.
 */
export async function refreshDailyReminder(): Promise<void> {
  const settings = await getSettings();

  await Notifications.cancelScheduledNotificationAsync(DAILY_CHECK_IDENTIFIER).catch(() => {});

  if (!settings.notificationsEnabled) {
    return;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    return;
  }

  const items = await getAllItems();
  const soonCount = items.filter((item) => daysUntil(item.expiryDate) <= settings.reminderDaysBefore).length;

  if (soonCount === 0) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_CHECK_IDENTIFIER,
    content: {
      title: '过期提醒',
      body: `您有 ${soonCount} 件商品即将过期，请及时处理`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.notificationHour,
      minute: settings.notificationMinute,
      channelId: CHANNEL_ID,
    },
  });
}
