import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { getSettings, setNotificationsEnabled, setReminderDaysBefore } from '../services/settings';
import { refreshDailyReminder } from '../services/notifications';

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [days, setDays] = useState('3');

  useEffect(() => {
    getSettings().then((settings) => {
      setEnabled(settings.notificationsEnabled);
      setDays(String(settings.reminderDaysBefore));
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

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>开启每日提醒（每天 9:00）</Text>
        <Switch value={enabled} onValueChange={handleToggle} />
      </View>

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
});
