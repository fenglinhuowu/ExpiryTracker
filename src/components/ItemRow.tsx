import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Item } from '../services/db';
import { daysUntil } from '../utils/date';

interface Props {
  item: Item;
  onDelete: (id: number) => void;
}

export default function ItemRow({ item, onDelete }: Props) {
  const days = daysUntil(item.expiryDate);
  let statusText: string;
  if (days < 0) statusText = `已过期 ${Math.abs(days)} 天`;
  else if (days === 0) statusText = '今天到期';
  else statusText = `还剩 ${days} 天`;

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.location} · {item.expiryDate} · {statusText}
        </Text>
      </View>
      <Pressable onPress={() => onDelete(item.id)} hitSlop={8}>
        <Text style={styles.delete}>删除</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  meta: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  delete: {
    color: '#d9534f',
    fontSize: 13,
  },
});
