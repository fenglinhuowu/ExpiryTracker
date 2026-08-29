import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';
import { getSettings, setNotificationsEnabled, setReminderDaysBefore, setNotificationTime } from '../services/settings';
import { refreshDailyReminder } from '../services/notifications';

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [days, setDays] = useState('3');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      setEnabled(settings.notificationsEnabled);
      setDays(String(settings.reminderDaysBefore));
      setHour(settings.notificationHour);
      setMinute(settings.notificationMinute);
    });
  }, []);

  const handleToggle = async (value: boolean) => {
    setEnabled(value);
    await setNotificationsEnabled(value);
    await refreshDailyReminder();
  };

  const handleDaysChange = async (value: string) => {
    setDays(value.replace(/[^0-9]/g, ''));
  };

  const handleDaysSubmit = async () => {
    const parsed = parseInt(days, 10);
    const safeDays = Number.isFinite(parsed) && parsed >= 0 ? parsed : 3;
    setDays(String(safeDays));
    await setReminderDaysBefore(safeDays);
    await refreshDailyReminder();
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (event?.type !== 'set' || !selectedDate) {
      return;
    }

    const nextHour = selectedDate.getHours();
    const nextMinute = selectedDate.getMinutes();
    setHour(nextHour);
    setMinute(nextMinute);
    await setNotificationTime(nextHour, nextMinute);
    await refreshDailyReminder();
  };

  const openBatterySettings = () => {
    if (Platform.OS === 'android') {
      IntentLauncher.startActivityAsync('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
    }
  };

  const openAppDetails = () => {
    if (Platform.OS === 'android') {
      const pkg = Application.applicationId;
      IntentLauncher.startActivityAsync('android.settings.APPLICATION_DETAILS_SETTINGS', {
        data: `package:${pkg}`,
      });
    }
  };

  const formatTime = (h: number, m: number) => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知设置</Text>
        <View style={styles.row}>
          <Text style={styles.label}>开启每日提醒</Text>
          <Switch value={enabled} onValueChange={handleToggle} />
        </View>

        <Pressable style={styles.row} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.label}>提醒时间</Text>
          <Text style={styles.timeText}>{formatTime(hour, minute)}</Text>
        </Pressable>
        {showTimePicker && (
          <DateTimePicker
            value={new Date(2000, 0, 1, hour, minute)}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
          />
        )}

        <View style={styles.row}>
          <Text style={styles.label}>提前几天提醒</Text>
          <TextInput
            style={styles.daysInput}
            value={days}
            onChangeText={handleDaysChange}
            onEndEditing={handleDaysSubmit}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>提醒可靠性优化</Text>
        <Text style={styles.description}>
          如果通知不准时或不弹出，请确保关闭系统的电池优化功能。
        </Text>

        <Pressable style={styles.troubleshootButton} onPress={openBatterySettings}>
          <Text style={styles.troubleshootButtonText}>设置“不优化电池使用”</Text>
        </Pressable>

        <Pressable style={styles.troubleshootButton} onPress={openAppDetails}>
          <Text style={styles.troubleshootButtonText}>去设置页开启“自启动/锁定”</Text>
        </Pressable>

        <Text style={styles.footerNote}>
          注：在系统设置页中，请找到“电池”或“省电”选项，将本应用设为“不优化”或“无限制”。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  label: {
    fontSize: 15,
  },
  daysInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 60,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  troubleshootButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  troubleshootButtonText: {
    color: '#007aff',
    fontSize: 14,
    fontWeight: '500',
  },
  footerNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
