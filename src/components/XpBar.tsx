import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, borderRadius, spacing } from '../constants/theme';
import { getXpProgress } from '../constants/levels';

interface Props {
  xp: number;
  levelName: string;
}

export function XpBar({ xp, levelName }: Props) {
  const progress = getXpProgress(xp);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelMedium" style={styles.level}>
          {levelName}
        </Text>
        <Text variant="labelSmall" style={styles.xpText}>
          {progress.current} / {progress.next} XP
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress.percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: spacing.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  level: { color: colors.accent, fontWeight: '700' },
  xpText: { color: colors.textSecondary },
  track: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
});
