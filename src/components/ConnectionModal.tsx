import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme';
import { ConnectionSettings } from '../types';

type Props = {
  initialValue: ConnectionSettings;
  onClose: () => void;
  onSave: (value: ConnectionSettings) => Promise<void>;
  visible: boolean;
};

export function ConnectionModal({ initialValue, onClose, onSave, visible }: Props) {
  const [apiUrl, setApiUrl] = useState(initialValue.apiUrl);
  const [familyKey, setFamilyKey] = useState(initialValue.familyKey);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setApiUrl(initialValue.apiUrl);
      setFamilyKey(initialValue.familyKey);
    }
  }, [initialValue, visible]);

  async function save() {
    if (!apiUrl.trim() || !familyKey.trim() || saving) return;
    setSaving(true);
    await onSave({ apiUrl, familyKey });
    setSaving(false);
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <LinearGradient colors={['#111D31', '#111329']} style={styles.card}>
          <Text style={styles.eyebrow}>اتصال امن</Text>
          <Text style={styles.title}>تنظیمات سرور خانواده</Text>
          <Text style={styles.description}>
            این اطلاعات در حافظه امن گوشی ذخیره می‌شوند. کلید Groq را اینجا وارد نکن.
          </Text>

          <Text style={styles.label}>آدرس HTTPS بک‌اند</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setApiUrl}
            placeholder="https://your-backend.example.com"
            placeholderTextColor="#637088"
            style={styles.input}
            value={apiUrl}
          />

          <Text style={styles.label}>رمز خانواده</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setFamilyKey}
            placeholder="رمز طولانی و اختصاصی"
            placeholderTextColor="#637088"
            secureTextEntry
            style={styles.input}
            value={familyKey}
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>بعداً</Text>
            </Pressable>
            <Pressable
              disabled={!apiUrl.trim() || !familyKey.trim() || saving}
              onPress={save}
              style={[styles.primaryButton, (!apiUrl.trim() || !familyKey.trim()) && styles.disabled]}
            >
              <Text style={styles.primaryText}>{saving ? 'در حال ذخیره...' : 'ذخیره امن'}</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 7, 15, 0.78)',
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 27,
    borderWidth: 1,
    maxWidth: 460,
    padding: 22,
    width: '100%',
  },
  eyebrow: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  description: {
    color: '#9DA9BE',
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 18,
    marginTop: 9,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  label: {
    color: '#C4CDDC',
    fontSize: 12,
    marginBottom: 7,
    marginTop: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  input: {
    backgroundColor: '#0A1323',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 15,
    borderWidth: 1,
    color: colors.white,
    fontSize: 13,
    paddingHorizontal: 13,
    paddingVertical: 13,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 15,
    flex: 1,
    paddingVertical: 13,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 15,
    borderWidth: 1,
    flex: 0.65,
    paddingVertical: 13,
  },
  primaryText: { color: '#06131C', fontSize: 13, fontWeight: '800' },
  secondaryText: { color: '#B6C0D2', fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.4 },
});
