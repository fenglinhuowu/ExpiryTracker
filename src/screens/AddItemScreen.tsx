import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { recognizeText } from '@react-native-ml-kit/text-recognition';
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
  const [recognizing, setRecognizing] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相机权限', '请在设置中开启相机权限');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      recognizeTextFromImage(uri);
    }
  };

  const recognizeTextFromImage = async (uri: string) => {
    setRecognizing(true);
    try {
      const result = await recognizeText(uri);
      if (result.text && result.text.trim()) {
        const cleaned = result.text.trim().replace(/\n+/g, ' ').substring(0, 50);
        setName(cleaned);
      }
    } catch {
      // OCR 失败时保留手动输入
    } finally {
      setRecognizing(false);
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
    if (!name.trim()) {
      Alert.alert('请输入商品名称');
      return;
    }
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
      <Text style={styles.label}>商品名称</Text>
      <View style={styles.nameRow}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          value={name}
          onChangeText={setName}
          placeholder="例如：牛奶"
        />
        <Pressable style={styles.cameraButton} onPress={handlePickImage}>
          {recognizing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.cameraButtonText}>拍照识别</Text>
          )}
        </Pressable>
      </View>

      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.photoPreview} />
      )}

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
          display="default"
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    justifyContent: 'center',
  },
  nameInput: {
    flex: 1,
  },
  cameraButton: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 90,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  photoPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
    resizeMode: 'cover',
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
