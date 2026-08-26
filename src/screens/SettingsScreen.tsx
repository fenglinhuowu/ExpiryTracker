import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setHour(selectedDate.getHours());
      setMinute(selectedDate.getMinutes());
      setNotificationTime(selectedDate.getHours(), selectedDate.getMinutes());
      refreshDailyReminder();
    }
  };

  const formatTime = (h: number, m: number) => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
});
