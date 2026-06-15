import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { ConnectionSettings } from '../types';

const API_URL_KEY = 'armingpt-api-url';
const FAMILY_KEY_KEY = 'armingpt-family-key';

async function getItem(key: string): Promise<string> {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? '';
  return (await SecureStore.getItemAsync(key)) ?? '';
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function loadConnectionSettings(): Promise<ConnectionSettings> {
  const [apiUrl, familyKey] = await Promise.all([getItem(API_URL_KEY), getItem(FAMILY_KEY_KEY)]);
  return { apiUrl, familyKey };
}

export async function saveConnectionSettings(settings: ConnectionSettings): Promise<ConnectionSettings> {
  const normalized = {
    apiUrl: settings.apiUrl.trim().replace(/\/+$/, ''),
    familyKey: settings.familyKey.trim(),
  };
  await Promise.all([setItem(API_URL_KEY, normalized.apiUrl), setItem(FAMILY_KEY_KEY, normalized.familyKey)]);
  return normalized;
}
