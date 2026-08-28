import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getAllItems } from './db';
import { getSettings } from './settings';
import { daysUntil } from '../utils/date';

const DAILY_CHECK_IDENTIFIER = 'daily-expiry-check';
const CHANNEL_ID = 'expiry-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '过期提醒',
      importance: Notifications.AndroidImportance.HIGH,
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
  const expiredCount = items.filter((item) => daysUntil(item.expiryDate) < 0).length;
  const expiringCount = items.filter((item) => daysUntil(item.expiryDate) >= 0 && daysUntil(item.expiryDate) <= settings.reminderDaysBefore).length;

  if (expiredCount === 0 && expiringCount === 0) {
    return;
  }

  let body = '';
  if (expiredCount > 0 && expiringCount > 0) {
    body = `您有 ${expiredCount} 件商品已过期，${expiringCount} 件即将过期，请及时处理`;
  } else if (expiredCount > 0) {
    body = `您有 ${expiredCount} 件商品已过期，请及时处理`;
  } else {
    body = `您有 ${expiringCount} 件商品即将过期，请及时处理`;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_CHECK_IDENTIFIER,
    content: {
      title: '过期提醒',
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.notificationHour,
      minute: settings.notificationMinute,
      channelId: CHANNEL_ID,
    },
  });
}
