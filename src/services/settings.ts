import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { ConnectionSettings } from '../types';

const FAMILY_KEY_KEY = 'armingpt-family-key';
export const ARMINGPT_BACKEND_URL = 'https://armingpt-backend.onrender.com';

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
  const familyKey = await getItem(FAMILY_KEY_KEY);
  return { apiUrl: ARMINGPT_BACKEND_URL, familyKey };
}

export async function saveConnectionSettings(settings: ConnectionSettings): Promise<ConnectionSettings> {
  const normalized = {
    apiUrl: ARMINGPT_BACKEND_URL,
    familyKey: settings.familyKey.trim(),
  };
  await setItem(FAMILY_KEY_KEY, normalized.familyKey);
  return normalized;
}

export async function validateFamilyKey(familyKey: string): Promise<'invalid' | 'unavailable' | 'valid'> {
  try {
    const response = await fetch(`${ARMINGPT_BACKEND_URL}/auth-check`, {
      headers: { 'X-Family-Key': familyKey.trim() },
      method: 'POST',
    });

    if (response.status === 401) return 'invalid';
    if (!response.ok) return 'unavailable';
    return 'valid';
  } catch {
    return 'unavailable';
  }
}
