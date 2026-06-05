import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { colors, spacing } from '../constants/theme';
import { historyRepository } from '../database/repositories/historyRepository';
import { formatDuration } from '../utils/gameLogic';
import { MainStackParamList } from '../navigation/types';
import { RootState } from '../store';

type Props = NativeStackScreenProps<MainStackParamList, 'History'>;

export function HistoryScreen({}: Props) {
  const { user } = useSelector((s: RootState) => s.auth);
  const history = user ? historyRepository.getGameHistory(user.id) : [];

  return (
    <GradientBackground>
      <FlatList
        data={history}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text variant="headlineSmall" style={styles.title}>
            Historique
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune partie enregistrée</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Icon
              name={item.won ? 'trophy' : 'close-circle'}
              size={28}
              color={item.won ? colors.success : colors.error}
            />
            <View style={styles.cardContent}>
              <Text style={styles.mode}>{item.mode.toUpperCase()}</Text>
              <Text style={styles.detail}>
                Score {item.score} • {item.correctAnswers} bonnes réponses
              </Text>
              <Text style={styles.detail}>
                {formatDuration(item.durationSeconds)} •{' '}
                {new Date(item.playedAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        )}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.lg },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: spacing.md,
    alignItems: 'center',
  },
  cardContent: { flex: 1 },
  mode: { color: colors.text, fontWeight: '700' },
  detail: { color: colors.textSecondary, fontSize: 13 },
});
