import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, borderRadius } from '../constants/theme';

interface Props {
  duration: number;
  timeLeft: number;
  onTimeout?: () => void;
}

export function TimerBar({ duration, timeLeft, onTimeout }: Props) {
  const progress = useSharedValue(timeLeft / duration);

  useEffect(() => {
    progress.value = withTiming(timeLeft / duration, { duration: 300 });
    if (timeLeft <= 0 && onTimeout) {
      onTimeout();
    }
  }, [timeLeft, duration, onTimeout, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const barColor =
    timeLeft > duration * 0.5
      ? colors.success
      : timeLeft > duration * 0.25
        ? colors.warning
        : colors.error;

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { backgroundColor: barColor }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: borderRadius.full },
});
