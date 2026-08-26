import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AddItemScreen from './src/screens/AddItemScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { refreshDailyReminder } from './src/services/notifications';

type Tab = 'home' | 'add' | 'settings';

const TABS: { key: Tab; label: string }[] = [
  { key: 'home', label: '首页' },
  { key: 'add', label: '添加' },
  { key: 'settings', label: '设置' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    refreshDailyReminder();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {tab === 'home' && <HomeScreen refreshKey={refreshKey} />}
        {tab === 'add' && (
          <AddItemScreen
            onSaved={() => {
              setRefreshKey((k) => k + 1);
              setTab('home');
            }}
          />
        )}
        {tab === 'settings' && <SettingsScreen />}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <Pressable key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabLabel: {
    fontSize: 14,
    color: '#999',
  },
  tabLabelActive: {
    color: '#007aff',
    fontWeight: '600',
  },
});
