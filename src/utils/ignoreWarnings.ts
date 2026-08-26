import { LogBox } from 'react-native';

// Must be imported before anything that imports expo-notifications, since Expo Go
// (SDK 53+) logs this the moment the module is required, and remote push isn't
// used here anyway - only local notifications.
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
