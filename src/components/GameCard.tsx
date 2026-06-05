import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, borderRadius, spacing } from '../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  onPress: () => void;
  delay?: number;
  style?: ViewStyle;
}

export function GameCard({
  title,
  subtitle,
  icon,
  iconColor = colors.accent,
  onPress,
  delay = 0,
  style,
}: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
          <Icon name={icon} size={32} color={iconColor} />
        </View>
        <View style={styles.textWrap}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: { flex: 1 },
  title: { color: colors.text, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, marginTop: 2 },
});
