import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getAllItems } from './db';
import { getSettings } from './settings';
import { daysUntil } from '../utils/date';

const DAILY_CHECK_IDENTIFIER = 'daily-expiry-check';
// Android notification channels are immutable for sound/vibration after creation.
// Bump version to migrate users away from previously silent channels.
const CHANNEL_ID = 'expiry-reminders-v5';
let refreshQueue: Promise<void> = Promise.resolve();

export interface NotificationDebugInfo {
  permissionStatus: string;
  granted: boolean;
  canAskAgain: boolean;
  androidPermissionImportance?: number;
  channelId?: string;
  channelName?: string | null;
  channelImportance?: number;
  channelSound?: string | null;
  channelEnableVibrate?: boolean;
  channelVibrationPattern?: number[] | null;
}

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
      importance: Notifications.AndroidImportance.MAX,
      enableVibrate: true,
      sound: 'default',
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      vibrationPattern: [0, 250, 250, 250],
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
async function refreshDailyReminderInternal(): Promise<void> {
  const settings = await getSettings();

  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});

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
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
      vibrate: [0, 500, 300, 500, 300, 500],
      sticky: true,
      autoDismiss: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.notificationHour,
      minute: settings.notificationMinute,
      channelId: CHANNEL_ID,
    },
  });
}

export function refreshDailyReminder(): Promise<void> {
  refreshQueue = refreshQueue
    .catch(() => {})
    .then(async () => {
      try {
        await refreshDailyReminderInternal();
      } catch (error) {
        console.error('refreshDailyReminder failed:', error);
      }
    });
  return refreshQueue;
}
