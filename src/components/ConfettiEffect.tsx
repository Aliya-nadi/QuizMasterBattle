import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface Props {
  visible: boolean;
}

export function ConfettiEffect({ visible }: Props) {
  if (!visible) {
    return null;
  }
  const { width } = Dimensions.get('window');
  return (
    <View style={styles.overlay} pointerEvents="none">
      <ConfettiCannon
        count={120}
        origin={{ x: width / 2, y: 0 }}
        fadeOut
        autoStart
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
  },
});
