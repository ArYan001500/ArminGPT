import { StyleSheet, Text, View } from 'react-native';

import { AppTheme, colors } from '../theme';
import { ChatMessage } from '../types';

type Props = {
  message: ChatMessage;
  theme?: AppTheme;
};

const modeLabels = {
  offline: 'پاسخ سریع آفلاین',
  online: 'پاسخ هوشمند',
  error: 'حالت آفلاین',
};

export function MessageBubble({ message, theme = colors }: Props) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: theme.userBubble }]
            : [styles.assistantBubble, { backgroundColor: theme.assistantBubble }],
        ]}
      >
        <Text style={[styles.text, { color: theme.white }]}>{message.text}</Text>
        {!isUser && message.mode && (
          <Text style={[styles.mode, { color: theme.accent }, message.mode === 'error' && styles.errorMode]}>
            {modeLabels[message.mode]}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 14, width: '100%' },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start' },
  avatar: {
    alignItems: 'center',
    borderRadius: 13,
    height: 27,
    justifyContent: 'center',
    marginTop: 3,
    width: 27,
  },
  avatarText: { color: '#07111F', fontSize: 13, fontWeight: '900' },
  bubble: { borderRadius: 20, maxWidth: '82%', paddingHorizontal: 15, paddingVertical: 12 },
  userBubble: {
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    borderBottomLeftRadius: 5,
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  mode: {
    fontSize: 9,
    marginTop: 7,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  errorMode: { color: '#F5A65B' },
});
