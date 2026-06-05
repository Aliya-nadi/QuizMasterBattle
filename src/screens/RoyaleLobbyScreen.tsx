import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { GameCard } from '../components/GameCard';
import { colors, spacing } from '../constants/theme';
import { BATTLE_TOPICS } from '../constants/quizData';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'RoyaleLobby'>;

export function RoyaleLobbyScreen({ navigation }: Props) {
  const [connection, setConnection] = useState('local');
  const [topicId, setTopicId] = useState(BATTLE_TOPICS[0].id);

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineSmall" style={styles.title}>
          Battle Royale
        </Text>
        <Text style={styles.desc}>
          Enchérissez sur le nombre de réponses que vous pouvez citer, puis prouvez-le !
        </Text>
        <SegmentedButtons
          value={connection}
          onValueChange={setConnection}
          buttons={[
            { value: 'local', label: 'Local' },
            { value: 'online', label: 'En ligne' },
          ]}
          style={styles.segment}
        />
        {BATTLE_TOPICS.map(topic => (
          <GameCard
            key={topic.id}
            title={topic.title}
            icon="gavel"
            iconColor={topicId === topic.id ? colors.warning : colors.textSecondary}
            onPress={() => setTopicId(topic.id)}
          />
        ))}
        {connection === 'local' ? (
          <Button
            mode="contained"
            buttonColor={colors.warning}
            onPress={() => navigation.navigate('RoyaleGame', { topicId })}>
            Commencer
          </Button>
        ) : (
          <Button
            mode="contained-tonal"
            onPress={() =>
              navigation.navigate('MultiplayerConnect', { mode: 'royale', type: 'online' })
            }>
            Salon en ligne
          </Button>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  desc: { color: colors.textSecondary, marginBottom: spacing.lg },
  segment: { marginBottom: spacing.lg },
});
