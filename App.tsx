import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { LogoMark } from './src/components/LogoMark';
import { ConnectionModal } from './src/components/ConnectionModal';
import { MessageBubble } from './src/components/MessageBubble';
import { SettingsModal } from './src/components/SettingsModal';
import { ThinkingDots } from './src/components/ThinkingDots';
import { askArminGPT } from './src/services/chat';
import { loadTheme, saveTheme } from './src/services/preferences';
import {
  ARMINGPT_BACKEND_URL,
  loadConnectionSettings,
  saveConnectionSettings,
} from './src/services/settings';
import { AppTheme, colors, ThemeName, themes } from './src/theme';
import { ChatMessage, ConnectionSettings } from './src/types';

const starterMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'سلام! من آرمین جی‌پی‌تی هستم. هر چیزی دوست داری از من بپرس.',
  mode: 'offline',
};

const suggestions = [
  'خودت را معرفی کن',
  'یک لطیفه بگو',
  'برای امروز برنامه بده',
  'یک جمله انگیزشی بگو',
];

function DynamicBackdrop({ theme }: { theme: AppTheme }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { duration: 6500, toValue: 1, useNativeDriver: true }),
        Animated.timing(drift, { duration: 6500, toValue: 0, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [drift]);

  if (theme.name !== 'aurora') return null;

  return (
    <View pointerEvents="none" style={styles.dynamicLayer}>
      <Animated.View
        style={[
          styles.dynamicOrb,
          {
            backgroundColor: theme.accent,
            transform: [
              { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-80, 140] }) },
              { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [-30, 110] }) },
              { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.25] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dynamicOrb,
          styles.dynamicOrbSecond,
          {
            backgroundColor: theme.secondary,
            transform: [
              { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [110, -100] }) },
              { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [100, -40] }) },
            ],
          },
        ]}
      />
    </View>
  );
}

function SplashScreen({ theme }: { theme: AppTheme }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.78)).current;
  const glow = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 0.85,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0.25,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, [fade, glow, scale]);

  return (
    <LinearGradient colors={theme.background} style={styles.splash}>
      <DynamicBackdrop theme={theme} />
      <Animated.View
        style={[
          styles.splashGlow,
          { borderColor: `${theme.secondary}66`, opacity: glow },
        ]}
      />
      <Animated.View style={[styles.splashContent, { opacity: fade, transform: [{ scale }] }]}>
        <LogoMark size={112} theme={theme} />
        <Text style={[styles.splashTitle, { color: theme.white }]}>ArminGPT</Text>
        <Text style={styles.splashTagline}>دستیار هوشمند خانواده</Text>
        <View style={[styles.companyLine, { backgroundColor: theme.accent }]} />
        <Text style={styles.companyText}>کاری از شرکت مهندسین</Text>
        <Text style={[styles.companyName, { color: theme.white }]}>فرزانگان آرمین پژوه</Text>
      </Animated.View>
    </LinearGradient>
  );
}

function ChatScreen({
  activeTheme,
  onSelectTheme,
  theme,
}: {
  activeTheme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
  theme: AppTheme;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<ConnectionSettings>({
    apiUrl: ARMINGPT_BACKEND_URL,
    familyKey: '',
  });
  const [connectionVisible, setConnectionVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    loadConnectionSettings().then((saved) => {
      setSettings(saved);
      if (!saved.familyKey) setConnectionVisible(true);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const answer = await askArminGPT(nextMessages, settings);
    setMessages((current) => [
      ...current,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: answer.text,
        mode: answer.mode,
      },
    ]);
    setIsLoading(false);
  }

  return (
    <LinearGradient colors={theme.background} style={styles.screen}>
      <DynamicBackdrop theme={theme} />
      <ConnectionModal
        initialValue={settings}
        onClose={() => setConnectionVisible(false)}
        onSave={async (next) => {
          const saved = await saveConnectionSettings(next);
          setSettings(saved);
          setConnectionVisible(false);
        }}
        theme={theme}
        visible={connectionVisible}
      />
      <SettingsModal
        activeTheme={activeTheme}
        onClose={() => setMenuVisible(false)}
        onSelectTheme={onSelectTheme}
        theme={theme}
        visible={menuVisible}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerIdentity}>
            <LogoMark size={48} theme={theme} />
            <View>
              <Text style={[styles.headerTitle, { color: theme.white }]}>ArminGPT</Text>
              <View style={styles.statusRow}>
                <View style={[styles.onlineDot, { backgroundColor: theme.accent }]} />
                <Text style={styles.headerSubtitle}>دستیار امن خانواده</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="ورود امن"
              accessibilityRole="button"
              onPress={() => setConnectionVisible(true)}
              style={({ pressed }) => [
                styles.secureBadge,
                { backgroundColor: `${theme.accent}16`, borderColor: `${theme.accent}44` },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.secureBadgeText, { color: theme.accent }]}>امن</Text>
              <Text style={[styles.lockIcon, { color: theme.accent }]}>●</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="تنظیمات برنامه"
              accessibilityRole="button"
              onPress={() => setMenuVisible(true)}
              style={({ pressed }) => [
                styles.settingsButton,
                { borderColor: `${theme.secondary}55` },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.settingsIcon, { color: theme.secondary }]}>⚙</Text>
            </Pressable>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.chatArea}
          keyboardVerticalOffset={8}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} theme={theme} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.heroCard}>
                <View style={[styles.heroAccent, { backgroundColor: theme.secondary }]} />
                <Text style={[styles.heroEyebrow, { color: theme.accent }]}>هر سؤال، یک گفت‌وگوی تازه</Text>
                <Text style={[styles.heroTitle, { color: theme.white }]}>امروز چطور کمکت کنم؟</Text>
                <Text style={styles.heroDescription}>
                  می‌توانی فارسی صحبت کنی، سؤال بپرسی یا فقط کمی گپ بزنی.
                </Text>
              </View>
            }
            ListFooterComponent={isLoading ? <ThinkingDots theme={theme} /> : null}
          />

          <View style={styles.suggestionWrap}>
            <FlatList
              horizontal
              inverted
              data={suggestions}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionList}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => sendMessage(item)}
                  style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </Pressable>
              )}
            />
          </View>

          <View style={styles.composerShell}>
            <LinearGradient
              colors={[`${theme.accent}38`, `${theme.secondary}3D`]}
              style={styles.composerBorder}
            >
              <View style={[styles.composer, { backgroundColor: theme.composer }]}>
                <TextInput
                  accessibilityLabel="پیام شما"
                  multiline
                  onChangeText={setInput}
                  onSubmitEditing={() => sendMessage()}
                  placeholder="پیامت را بنویس..."
                  placeholderTextColor="#78849B"
                  returnKeyType="send"
                  style={[styles.input, { color: theme.white }]}
                  value={input}
                />
                <Pressable
                  accessibilityLabel="ارسال پیام"
                  accessibilityRole="button"
                  disabled={!input.trim() || isLoading}
                  onPress={() => sendMessage()}
                  style={({ pressed }) => [
                    styles.sendButton,
                    { backgroundColor: theme.accent },
                    (!input.trim() || isLoading) && styles.sendButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.sendIcon}>↑</Text>
                </Pressable>
              </View>
            </LinearGradient>
            <Text style={styles.footerNote}>اطلاعات خیلی محرمانه را در چت ارسال نکنید.</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function App() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [activeTheme, setActiveTheme] = useState<ThemeName>('midnight');

  useEffect(() => {
    const timer = setTimeout(() => setSplashVisible(false), 2400);
    loadTheme().then(setActiveTheme);
    return () => clearTimeout(timer);
  }, []);

  async function selectTheme(nextTheme: ThemeName) {
    setActiveTheme(nextTheme);
    await saveTheme(nextTheme);
  }

  const theme = themes[activeTheme];

  return (
    <>
      <StatusBar style="light" />
      {isSplashVisible ? (
        <SplashScreen theme={theme} />
      ) : (
        <ChatScreen activeTheme={activeTheme} onSelectTheme={selectTheme} theme={theme} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  dynamicLayer: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dynamicOrb: {
    borderRadius: 220,
    height: 360,
    left: -120,
    opacity: 0.09,
    position: 'absolute',
    top: -100,
    width: 360,
  },
  dynamicOrbSecond: { bottom: -140, left: undefined, right: -110, top: undefined },
  splash: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  splashGlow: {
    backgroundColor: 'rgba(29, 211, 176, 0.045)',
    borderColor: 'rgba(124, 92, 255, 0.32)',
    borderRadius: 220,
    borderWidth: 1,
    height: 390,
    position: 'absolute',
    width: 390,
  },
  splashContent: { alignItems: 'center', paddingHorizontal: 28 },
  splashTitle: {
    color: colors.white,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 24,
  },
  splashTagline: {
    color: '#AAB8D2',
    fontSize: 17,
    marginTop: 7,
    writingDirection: 'rtl',
  },
  companyLine: {
    backgroundColor: colors.accent,
    borderRadius: 3,
    height: 3,
    marginBottom: 20,
    marginTop: 46,
    width: 44,
  },
  companyText: {
    color: '#9DABC2',
    fontSize: 14,
    writingDirection: 'rtl',
  },
  companyName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 7,
    writingDirection: 'rtl',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  headerIdentity: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  headerTitle: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '800',
  },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 2 },
  onlineDot: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  headerSubtitle: { color: '#93A1B8', fontSize: 11, writingDirection: 'rtl' },
  secureBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(29, 211, 176, 0.09)',
    borderColor: 'rgba(29, 211, 176, 0.24)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  secureBadgeText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  lockIcon: { color: colors.accent, fontSize: 8 },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  settingsIcon: { fontSize: 17 },
  chatArea: { flex: 1 },
  listContent: { paddingBottom: 10, paddingHorizontal: 15 },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 24,
    marginTop: 20,
    overflow: 'hidden',
    padding: 22,
  },
  heroAccent: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    height: 5,
    marginBottom: 18,
    width: 36,
  },
  heroEyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 9,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroDescription: {
    color: '#A3AEC2',
    fontSize: 14,
    lineHeight: 24,
    marginTop: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  suggestionWrap: { height: 50 },
  suggestionList: { gap: 8, paddingHorizontal: 15, paddingVertical: 5 },
  suggestion: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  suggestionText: { color: '#C6CFE0', fontSize: 12, writingDirection: 'rtl' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  composerShell: { paddingBottom: Platform.OS === 'ios' ? 8 : 12, paddingHorizontal: 14 },
  composerBorder: { borderRadius: 25, padding: 1 },
  composer: {
    alignItems: 'flex-end',
    backgroundColor: '#101A2C',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    padding: 7,
  },
  input: {
    color: colors.white,
    flex: 1,
    fontSize: 15,
    maxHeight: 110,
    minHeight: 43,
    paddingHorizontal: 11,
    paddingVertical: 11,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  sendButtonDisabled: { backgroundColor: '#354155' },
  sendIcon: {
    color: '#06131C',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 28,
  },
  footerNote: {
    color: '#6F7C92',
    fontSize: 10,
    marginTop: 7,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
