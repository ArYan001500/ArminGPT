import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppTheme, colors } from '../theme';
import { ConnectionSettings } from '../types';
import { validateFamilyKey } from '../services/settings';

type Props = {
  initialValue: ConnectionSettings;
  onClose: () => void;
  onSave: (value: ConnectionSettings) => Promise<void>;
  theme?: AppTheme;
  visible: boolean;
};

export function ConnectionModal({ initialValue, onClose, onSave, theme = colors, visible }: Props) {
  const [familyKey, setFamilyKey] = useState(initialValue.familyKey);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setFamilyKey(initialValue.familyKey);
      setError('');
    }
  }, [initialValue, visible]);

  async function save() {
    if (!familyKey.trim() || saving) return;
    setSaving(true);
    setError('');
    const validation = await validateFamilyKey(familyKey);

    if (validation !== 'valid') {
      setError(
        validation === 'invalid'
          ? 'رمز ورود اشتباه است'
          : 'ارتباط با سرور برقرار نشد. دوباره تلاش کن.',
      );
      setSaving(false);
      return;
    }

    await onSave({ apiUrl: initialValue.apiUrl, familyKey });
    setSaving(false);
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <LinearGradient colors={[theme.assistantBubble, theme.composer]} style={styles.card}>
          <Text style={[styles.eyebrow, { color: theme.accent }]}>ورود امن</Text>
          <Text style={[styles.title, { color: theme.white }]}>ورود خانواده آرمین</Text>
          <Text style={styles.description}>
            برای استفاده از پاسخ‌های هوشمند آنلاین، رمز خانوادگی را وارد کن. رمز در حافظه امن دستگاه ذخیره می‌شود.
          </Text>

          <Text style={styles.label}>رمز ورود خانوادگی</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(value) => {
              setFamilyKey(value);
              setError('');
            }}
            placeholder="رمز خانواده"
            placeholderTextColor="#637088"
            secureTextEntry
            style={[styles.input, { color: theme.white }]}
            value={familyKey}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>بعداً</Text>
            </Pressable>
            <Pressable
              disabled={!familyKey.trim() || saving}
              onPress={save}
              style={[
                styles.primaryButton,
                { backgroundColor: theme.accent },
                !familyKey.trim() && styles.disabled,
              ]}
            >
              <Text style={styles.primaryText}>{saving ? 'در حال ورود...' : 'ورود امن'}</Text>
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
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  title: {
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
    fontSize: 13,
    paddingHorizontal: 13,
    paddingVertical: 13,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  error: {
    color: '#FF8A8A',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  primaryButton: {
    alignItems: 'center',
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
