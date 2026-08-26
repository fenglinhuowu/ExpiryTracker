import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

function AppContent() {
  const [tab, setTab] = useState<Tab>('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    refreshDailyReminder();
  }, []);

  return (
    <View style={styles.container}>
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

      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        {TABS.map((t) => (
          <Pressable key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
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
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
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
