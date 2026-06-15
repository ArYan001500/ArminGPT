import { LinearGradient } from 'expo-linear-gradient';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppTheme, ThemeName, themes } from '../theme';

type Props = {
  activeTheme: ThemeName;
  onClose: () => void;
  onSelectTheme: (theme: ThemeName) => void;
  theme: AppTheme;
  visible: boolean;
};

const themeOptions: Array<{ description: string; label: string; name: ThemeName }> = [
  { description: 'تیره، آرام و حرفه‌ای', label: 'Midnight', name: 'midnight' },
  { description: 'گرم، لوکس و نارنجی', label: 'Sunset', name: 'sunset' },
  { description: 'نورهای زنده و متحرک', label: 'Aurora Dynamic', name: 'aurora' },
];

const contacts = [
  { label: 'تماس با مدیرعامل', phone: '09128022366' },
  { label: 'تماس با بخش مالی', phone: '09122683626' },
];

export function SettingsModal({ activeTheme, onClose, onSelectTheme, theme, visible }: Props) {
  const version = '1.1.0';

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <LinearGradient colors={[theme.assistantBubble, theme.composer]} style={styles.card}>
          <View style={styles.headingRow}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
            <View>
              <Text style={[styles.eyebrow, { color: theme.accent }]}>شخصی‌سازی ArminGPT</Text>
              <Text style={[styles.title, { color: theme.white }]}>تنظیمات</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>پوسته و تم</Text>
            <View style={styles.themeGrid}>
              {themeOptions.map((option) => {
                const palette = themes[option.name];
                const selected = activeTheme === option.name;
                return (
                  <Pressable
                    key={option.name}
                    onPress={() => onSelectTheme(option.name)}
                    style={[
                      styles.themeCard,
                      selected && { borderColor: palette.accent, borderWidth: 2 },
                    ]}
                  >
                    <LinearGradient colors={palette.background} style={styles.themePreview}>
                      <View style={[styles.previewOrb, { backgroundColor: palette.accent }]} />
                      <View style={[styles.previewOrbSmall, { backgroundColor: palette.secondary }]} />
                    </LinearGradient>
                    <Text style={[styles.themeLabel, { color: theme.white }]}>{option.label}</Text>
                    <Text style={styles.themeDescription}>{option.description}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>ارتباط با شرکت</Text>
            {contacts.map((contact) => (
              <Pressable
                key={contact.phone}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                style={styles.contactCard}
              >
                <View style={[styles.callIcon, { backgroundColor: `${theme.accent}22` }]}>
                  <Text style={[styles.callIconText, { color: theme.accent }]}>☎</Text>
                </View>
                <View style={styles.contactText}>
                  <Text style={[styles.contactLabel, { color: theme.white }]}>{contact.label}</Text>
                  <Text style={styles.phone}>{contact.phone}</Text>
                </View>
              </Pressable>
            ))}

            <View style={styles.versionCard}>
              <Text style={styles.versionLabel}>نسخه برنامه</Text>
              <Text style={[styles.version, { color: theme.accent }]}>ArminGPT v{version}</Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 7, 15, 0.82)',
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 28,
    borderWidth: 1,
    maxHeight: '88%',
    maxWidth: 620,
    padding: 22,
    width: '100%',
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  closeButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 15,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  closeText: { color: '#C9D2E3', fontSize: 24, lineHeight: 27 },
  eyebrow: { fontSize: 11, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  title: { fontSize: 26, fontWeight: '900', marginTop: 3, textAlign: 'right', writingDirection: 'rtl' },
  sectionTitle: {
    color: '#AEB9CC',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  themeCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 145,
    padding: 8,
  },
  themePreview: { borderRadius: 12, height: 62, overflow: 'hidden' },
  previewOrb: { borderRadius: 30, height: 45, left: 15, opacity: 0.72, position: 'absolute', top: 9, width: 45 },
  previewOrbSmall: { borderRadius: 20, height: 32, opacity: 0.75, position: 'absolute', right: 18, top: 15, width: 32 },
  themeLabel: { fontSize: 13, fontWeight: '800', marginTop: 8, textAlign: 'right' },
  themeDescription: { color: '#8F9BB0', fontSize: 10, marginTop: 3, textAlign: 'right', writingDirection: 'rtl' },
  contactCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 9,
    padding: 13,
  },
  callIcon: { alignItems: 'center', borderRadius: 15, height: 42, justifyContent: 'center', width: 42 },
  callIconText: { fontSize: 18 },
  contactText: { flex: 1 },
  contactLabel: { fontSize: 13, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  phone: { color: '#98A5BB', fontSize: 12, marginTop: 4, textAlign: 'right' },
  versionCard: {
    alignItems: 'center',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 16,
  },
  versionLabel: { color: '#98A5BB', fontSize: 12, writingDirection: 'rtl' },
  version: { fontSize: 12, fontWeight: '900' },
});
