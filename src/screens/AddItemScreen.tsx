import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相机权限', '请在设置中开启相机权限');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.3,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      setExpiryDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  const handleSubmit = async () => {
    if (!isValidDateString(expiryDate)) {
      Alert.alert('请输入正确的到期日期', '格式为 YYYY-MM-DD');
      return;
    }

    await addItem(name.trim(), expiryDate, location.trim(), photoUri);
    await refreshDailyReminder();
    setName('');
    setExpiryDate('');
    setLocation('');
    setPhotoUri(null);
    onSaved();
    Alert.alert('已添加');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>商品名称（选填）</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="例如：牛奶"
      />

      <Text style={styles.label}>商品照片</Text>
      <Pressable style={styles.photoButton} onPress={handlePickImage}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoButtonText}>拍照</Text>
        )}
      </Pressable>

      <Text style={styles.label}>到期日期</Text>
      <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={expiryDate ? styles.dateText : styles.datePlaceholder}>
          {expiryDate || todayString()}
        </Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <Text style={styles.label}>存放位置（选填）</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="例如：冰箱"
      />

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
    justifyContent: 'center',
  },
  photoButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoButtonText: {
    color: '#007aff',
    fontSize: 15,
  },
  dateText: {
    fontSize: 15,
    color: '#000',
  },
  datePlaceholder: {
    fontSize: 15,
    color: '#999',
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
