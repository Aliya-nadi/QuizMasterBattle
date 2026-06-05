import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { GameCard } from '../components/GameCard';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { XpBar } from '../components/XpBar';
import { colors, spacing } from '../constants/theme';
import { getLevelFromXp } from '../constants/levels';
import { RootState } from '../store';
import { userRepository } from '../database/repositories/userRepository';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { user, profile } = useSelector((s: RootState) => s.auth);
  const grade = profile ? getLevelFromXp(profile.xp) : null;
  const ranking = user ? userRepository.getAllUsersRanked() : [];
  const myRank = ranking.findIndex(r => r.id === user?.id) + 1;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <PlayerAvatar avatarId={profile?.avatarId ?? 'avatar_1'} size={64} showBorder />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.name}>
              {user?.pseudo ?? 'Joueur'}
            </Text>
            <Text variant="bodyMedium" style={styles.rank}>
              Classement local : #{myRank || '-'}
            </Text>
          </View>
        </View>
        {profile && grade ? (
          <XpBar xp={profile.xp} levelName={`Niv. ${profile.level} — ${grade.name}`} />
        ) : null}
        <View style={styles.stats}>
          <StatBox label="Victoires" value={String(profile?.wins ?? 0)} />
          <StatBox label="Parties" value={String(profile?.gamesPlayed ?? 0)} />
          <StatBox label="Score" value={String(profile?.totalScore ?? 0)} />
        </View>
        <Text variant="titleMedium" style={styles.section}>
          Modes de jeu
        </Text>
        <GameCard
          title="Solo"
          subtitle="Quiz classique — une erreur et c'est fini"
          icon="account"
          iconColor={colors.accent}
          onPress={() => navigation.navigate('SoloCategory')}
          delay={0}
        />
        <GameCard
          title="Battle"
          subtitle="Multijoueur — dernier debout"
          icon="sword-cross"
          iconColor={colors.secondary}
          onPress={() => navigation.navigate('BattleLobby')}
          delay={100}
        />
        <GameCard
          title="Battle Royale"
          subtitle="Enchères et défis"
          icon="crown"
          iconColor={colors.warning}
          onPress={() => navigation.navigate('RoyaleLobby')}
          delay={200}
        />
        <Text variant="titleMedium" style={styles.section}>
          Menu
        </Text>
        <GameCard
          title="Profil"
          subtitle="Stats, badges, avatars"
          icon="account-circle"
          onPress={() => navigation.navigate('Profile')}
          delay={300}
        />
        <GameCard
          title="Historique"
          subtitle="Vos parties récentes"
          icon="history"
          onPress={() => navigation.navigate('History')}
          delay={350}
        />
        <GameCard
          title="Paramètres"
          subtitle="Thème, sons, langue"
          icon="cog"
          onPress={() => navigation.navigate('Settings')}
          delay={400}
        />
      </ScrollView>
    </GradientBackground>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text variant="titleLarge" style={styles.statValue}>
        {value}
      </Text>
      <Text variant="labelSmall" style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  headerText: { marginLeft: spacing.md, flex: 1 },
  name: { color: colors.text, fontWeight: '800' },
  rank: { color: colors.textSecondary },
  stats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { color: colors.accent, fontWeight: '800' },
  statLabel: { color: colors.textSecondary },
  section: { color: colors.text, fontWeight: '700', marginBottom: spacing.md, marginTop: spacing.sm },
});
