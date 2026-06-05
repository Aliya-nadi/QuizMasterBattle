import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AVATARS } from '../constants/avatars';
import { colors } from '../constants/theme';

interface Props {
  avatarId: string;
  size?: number;
  showBorder?: boolean;
}

export function PlayerAvatar({ avatarId, size = 48, showBorder = false }: Props) {
  const avatar = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0];
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: showBorder ? 3 : 0,
        },
      ]}>
      <Icon name={avatar.icon} size={size * 0.55} color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.accent,
  },
});
