import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { XpBar } from '../components/XpBar';
import { colors, spacing } from '../constants/theme';
import { getLevelFromXp } from '../constants/levels';
import { ACHIEVEMENTS_DEF } from '../constants/quizData';
import { getDatabase } from '../database/sqlite/connection';
import { userRepository } from '../database/repositories/userRepository';
import { MainStackParamList } from '../navigation/types';
import { RootState } from '../store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

export function ProfileScreen({}: Props) {
  const { user, profile } = useSelector((s: RootState) => s.auth);
  const grade = profile ? getLevelFromXp(profile.xp) : null;
  const winRatio = user ? userRepository.getWinRatio(user.id) : 0;

  const achievements = user
    ? ACHIEVEMENTS_DEF.map(ach => {
        const db = getDatabase();
        const r = db.execute(
          'SELECT unlocked FROM achievements WHERE id = ? AND user_id = ?',
          [ach.id, user.id],
        );
        const unlocked =
          r.rows && r.rows.length > 0
            ? Boolean((r.rows.item(0) as { unlocked: number }).unlocked)
            : false;
        return { ...ach, unlocked };
      })
    : [];

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <PlayerAvatar avatarId={profile?.avatarId ?? 'avatar_1'} size={80} showBorder />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.pseudo}
          </Text>
          <Text style={styles.grade}>{grade?.title}</Text>
        </View>
        {profile && grade ? (
          <XpBar xp={profile.xp} levelName={grade.name} />
        ) : null}
        <View style={styles.statsGrid}>
          <Stat label="Niveau" value={String(profile?.level ?? 1)} />
          <Stat label="XP" value={String(profile?.xp ?? 0)} />
          <Stat label="Score total" value={String(profile?.totalScore ?? 0)} />
          <Stat label="Victoires" value={String(profile?.wins ?? 0)} />
          <Stat label="Défaites" value={String(profile?.losses ?? 0)} />
          <Stat label="Ratio" value={`${winRatio}%`} />
        </View>
        <Text variant="titleMedium" style={styles.section}>
          Badges
        </Text>
        {achievements.map(ach => (
          <View key={ach.id} style={[styles.badge, !ach.unlocked && styles.badgeLocked]}>
            <Icon
              name={ach.icon}
              size={28}
              color={ach.unlocked ? colors.warning : colors.textSecondary}
            />
            <View style={styles.badgeText}>
              <Text style={styles.badgeTitle}>{ach.title}</Text>
              <Text style={styles.badgeDesc}>{ach.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </GradientBackground>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  name: { color: colors.text, fontWeight: '800', marginTop: spacing.md },
  grade: { color: colors.accent },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.lg },
  stat: {
    width: '30%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: { color: colors.text, fontWeight: '700', fontSize: 18 },
  statLabel: { color: colors.textSecondary, fontSize: 11 },
  section: { color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  badgeLocked: { opacity: 0.5 },
  badgeText: { flex: 1 },
  badgeTitle: { color: colors.text, fontWeight: '600' },
  badgeDesc: { color: colors.textSecondary, fontSize: 12 },
});
