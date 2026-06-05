import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { GameCard } from '../components/GameCard';
import { colors, spacing } from '../constants/theme';
import { BATTLE_TOPICS } from '../constants/quizData';
import { MainStackParamList } from '../navigation/types';
import { RootState } from '../store';
import type { BattlePlayer } from '../types';

type Props = NativeStackScreenProps<MainStackParamList, 'BattleLobby'>;

export function BattleLobbyScreen({ navigation }: Props) {
  const { user } = useSelector((s: RootState) => s.auth);
  const [connection, setConnection] = useState('local');
  const [playerNames, setPlayerNames] = useState('Joueur 2, Joueur 3');
  const [selectedTopic, setSelectedTopic] = useState(BATTLE_TOPICS[0].id);

  const startLocalBattle = () => {
    const names = playerNames.split(',').map(n => n.trim()).filter(Boolean);
    const players: BattlePlayer[] = [
      {
        id: user?.id?.toString() ?? '1',
        name: user?.pseudo ?? 'Joueur 1',
        avatarId: 'avatar_1',
        isEliminated: false,
        score: 0,
      },
      ...names.map((name, i) => ({
        id: `p${i + 2}`,
        name,
        avatarId: 'avatar_2',
        isEliminated: false,
        score: 0,
      })),
    ];
    navigation.navigate('BattleGame', { topicId: selectedTopic, players, connection });
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineSmall" style={styles.title}>
          Mode Battle
        </Text>
        <SegmentedButtons
          value={connection}
          onValueChange={setConnection}
          buttons={[
            { value: 'local', label: 'Local' },
            { value: 'bluetooth', label: 'Bluetooth' },
            { value: 'wifi', label: 'Wi-Fi' },
            { value: 'online', label: 'En ligne' },
          ]}
          style={styles.segment}
        />
        {connection === 'local' ? (
          <>
            <Text style={styles.label}>Joueurs (séparés par virgule)</Text>
            <TextInput
              value={playerNames}
              onChangeText={setPlayerNames}
              mode="outlined"
              style={styles.input}
              textColor={colors.text}
            />
          </>
        ) : (
          <Button
            mode="contained-tonal"
            onPress={() =>
              navigation.navigate('MultiplayerConnect', {
                mode: 'battle',
                type: connection as 'bluetooth' | 'wifi' | 'online',
              })
            }
            style={styles.connectBtn}>
            Configurer {connection}
          </Button>
        )}
        <Text variant="titleMedium" style={styles.section}>
          Thème
        </Text>
        {BATTLE_TOPICS.map(topic => (
          <GameCard
            key={topic.id}
            title={topic.title}
            subtitle={topic.hint}
            icon="format-list-bulleted"
            iconColor={selectedTopic === topic.id ? colors.accent : colors.textSecondary}
            onPress={() => setSelectedTopic(topic.id)}
          />
        ))}
        {connection === 'local' && (
          <Button mode="contained" onPress={startLocalBattle} buttonColor={colors.primary}>
            Lancer la partie
          </Button>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.lg },
  segment: { marginBottom: spacing.lg },
  label: { color: colors.textSecondary, marginBottom: spacing.sm },
  input: { marginBottom: spacing.lg, backgroundColor: colors.surface },
  connectBtn: { marginBottom: spacing.lg },
  section: { color: colors.text, marginVertical: spacing.md },
});
