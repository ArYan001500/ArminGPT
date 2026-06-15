import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { ThemeName, themes } from '../theme';

const THEME_KEY = 'armingpt-theme';

export async function loadTheme(): Promise<ThemeName> {
  const saved =
    Platform.OS === 'web'
      ? globalThis.localStorage?.getItem(THEME_KEY)
      : await SecureStore.getItemAsync(THEME_KEY);

  return saved && saved in themes ? (saved as ThemeName) : 'midnight';
}

export async function saveTheme(theme: ThemeName): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(THEME_KEY, theme);
    return;
  }
  await SecureStore.setItemAsync(THEME_KEY, theme);
}
