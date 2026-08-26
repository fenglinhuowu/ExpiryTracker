import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CollapsibleSection from '../components/CollapsibleSection';
import ItemRow from '../components/ItemRow';
import { deleteItem, getAllItems, Item } from '../services/db';
import { getSettings } from '../services/settings';
import { refreshDailyReminder } from '../services/notifications';
import { daysUntil } from '../utils/date';

interface Props {
  refreshKey: number;
}

export default function HomeScreen({ refreshKey }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);

  const load = useCallback(async () => {
    const [allItems, settings] = await Promise.all([getAllItems(), getSettings()]);
    setItems(allItems);
    setReminderDaysBefore(settings.reminderDaysBefore);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleDelete = async (id: number) => {
    await deleteItem(id);
    await load();
    await refreshDailyReminder();
  };

  const soon = items.filter((item) => daysUntil(item.expiryDate) <= reminderDaysBefore);
  const normal = items.filter((item) => daysUntil(item.expiryDate) > reminderDaysBefore);

  return (
    <View style={styles.container}>
      <CollapsibleSection title="即将过期" count={soon.length} tintColor="#d9534f">
        {soon.length === 0 ? (
          <Text style={styles.empty}>暂无即将过期的商品</Text>
        ) : (
          <FlatList
            data={soon}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ItemRow item={item} onDelete={handleDelete} />}
            scrollEnabled={false}
          />
        )}
      </CollapsibleSection>

      <CollapsibleSection title="正常" count={normal.length} tintColor="#5cb85c">
        {normal.length === 0 ? (
          <Text style={styles.empty}>暂无商品</Text>
        ) : (
          <FlatList
            data={normal}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ItemRow item={item} onDelete={handleDelete} />}
            scrollEnabled={false}
          />
        )}
      </CollapsibleSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  empty: {
    color: '#999',
    fontSize: 13,
    paddingVertical: 8,
  },
});
