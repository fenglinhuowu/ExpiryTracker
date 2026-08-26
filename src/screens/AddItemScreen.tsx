import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { addItem } from '../services/db';
import { refreshDailyReminder } from '../services/notifications';
import { isValidDateString, todayString } from '../utils/date';

interface Props {
  onSaved: () => void;
}

export default function AddItemScreen({ onSaved }: Props) {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('请输入商品名称');
      return;
    }
    if (!isValidDateString(expiryDate)) {
      Alert.alert('请输入正确的到期日期', '格式为 YYYY-MM-DD');
      return;
    }
    if (!location.trim()) {
      Alert.alert('请输入存放位置');
      return;
    }

    await addItem(name.trim(), expiryDate, location.trim());
    await refreshDailyReminder();
    setName('');
    setExpiryDate('');
    setLocation('');
    onSaved();
    Alert.alert('已添加');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>商品名称</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="例如：牛奶" />

      <Text style={styles.label}>到期日期</Text>
      <TextInput
        style={styles.input}
        value={expiryDate}
        onChangeText={setExpiryDate}
        placeholder={todayString()}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>存放位置</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="例如：冰箱" />

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>保存</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
