import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  size: number;
};

export function LogoMark({ size }: Props) {
  const coreSize = size * 0.72;

  return (
    <View style={[styles.shell, { height: size, width: size }]}>
      <View
        style={[
          styles.orbit,
          {
            borderRadius: size / 2,
            height: size,
            transform: [{ rotate: '25deg' }],
            width: size * 0.58,
          },
        ]}
      />
      <View
        style={[
          styles.orbit,
          {
            borderRadius: size / 2,
            height: size,
            transform: [{ rotate: '-55deg' }],
            width: size * 0.58,
          },
        ]}
      />
      <LinearGradient
        colors={['#1DD3B0', '#4EA8FF', '#7C5CFF']}
        style={[
          styles.core,
          {
            borderRadius: coreSize / 2,
            height: coreSize,
            width: coreSize,
          },
        ]}
      >
        <Text style={[styles.letter, { fontSize: coreSize * 0.47 }]}>A</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { alignItems: 'center', justifyContent: 'center' },
  orbit: {
    borderColor: 'rgba(92, 225, 209, 0.34)',
    borderWidth: 1,
    position: 'absolute',
  },
  core: {
    alignItems: 'center',
    elevation: 12,
    justifyContent: 'center',
    shadowColor: '#1DD3B0',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },
  letter: {
    color: '#06131C',
    fontWeight: '900',
    letterSpacing: -2,
  },
});
