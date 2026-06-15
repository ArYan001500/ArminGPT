import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AppTheme, colors } from '../theme';

export function ThinkingDots({ theme = colors }: { theme?: AppTheme }) {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.stagger(
        170,
        dots.map((dot) =>
          Animated.sequence([
            Animated.timing(dot, { duration: 350, toValue: 1, useNativeDriver: true }),
            Animated.timing(dot, { duration: 350, toValue: 0.3, useNativeDriver: true }),
          ]),
        ),
      ),
    );
    animation.start();
    return () => animation.stop();
  }, [dots]);

  return (
    <View style={styles.shell}>
      {dots.map((dot, index) => (
        <Animated.View key={index} style={[styles.dot, { backgroundColor: theme.accent, opacity: dot }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#151F33',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dot: { borderRadius: 4, height: 7, width: 7 },
});
