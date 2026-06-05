import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { TimerBar } from '../components/TimerBar';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { colors, spacing } from '../constants/theme';
import { BATTLE_TOPICS } from '../constants/quizData';
import { MainStackParamList } from '../navigation/types';
import { RootState } from '../store';
import {
  battleEliminatePlayer,
  battleNextTurn,
  battleSetTimeLeft,
  battleSubmitAnswer,
  endBattle,
  startBattle,
} from '../store/slices/gameSlice';
import { isValidBattleAnswer, normalizeAnswer } from '../utils/gameLogic';
import { historyRepository } from '../database/repositories/historyRepository';

type Props = NativeStackScreenProps<MainStackParamList, 'BattleGame'>;

const TURN_DURATION = 30;

export function BattleGameScreen({ navigation, route }: Props) {
  const { topicId, players: initialPlayers } = route.params;
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const battle = useSelector((s: RootState) => s.game.battle);
  const [answer, setAnswer] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const topic = BATTLE_TOPICS.find(t => t.id === topicId);

  useEffect(() => {
    dispatch(startBattle({ topicId, players: initialPlayers }));
  }, [dispatch, topicId, initialPlayers]);

  useEffect(() => {
    if (!battle.isPlaying) {
      return;
    }
    const timer = setInterval(() => {
      if (battle.turnTimeLeft <= 1) {
        const current = battle.players[battle.currentPlayerIndex];
        dispatch(battleEliminatePlayer(current.id));
        dispatch(battleNextTurn());
        checkWinner();
      } else {
        dispatch(battleSetTimeLeft(battle.turnTimeLeft - 1));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [battle.isPlaying, battle.turnTimeLeft, battle.currentPlayerIndex]);

  const activePlayers = battle.players.filter(p => !p.isEliminated);

  const checkWinner = () => {
    const remaining = battle.players.filter(p => !p.isEliminated);
    if (remaining.length <= 1) {
      dispatch(endBattle());
      const won = remaining[0]?.id === user?.id?.toString();
      if (won) {
        setShowConfetti(true);
      }
      if (user) {
        historyRepository.addBattleHistory(user.id, {
          topicId,
          playersCount: battle.players.length,
          placement: won ? 1 : battle.players.length,
          won,
          durationSeconds: 60,
        });
      }
    }
  };

  const submitAnswer = () => {
    const current = battle.players[battle.currentPlayerIndex];
    const trimmed = answer.trim();
    if (!trimmed) {
      Alert.alert('Éliminé', 'Aucune réponse proposée');
      dispatch(battleEliminatePlayer(current.id));
      dispatch(battleNextTurn());
      setAnswer('');
      checkWinner();
      return;
    }
    const valid = isValidBattleAnswer(topicId, trimmed, battle.usedAnswers);
    if (!valid) {
      Alert.alert('Éliminé', 'Réponse incorrecte ou déjà utilisée');
      dispatch(battleEliminatePlayer(current.id));
    } else {
      dispatch(battleSubmitAnswer(normalizeAnswer(trimmed)));
    }
    setAnswer('');
    dispatch(battleNextTurn());
    checkWinner();
  };

  if (!battle.isPlaying && activePlayers.length <= 1) {
    const winner = activePlayers[0] ?? battle.players[0];
    return (
      <GradientBackground>
        <ConfettiEffect visible={showConfetti} />
        <View style={styles.result}>
          <Text variant="headlineMedium" style={styles.winner}>
            {winner?.name} gagne !
          </Text>
          <Button mode="contained" onPress={() => navigation.popToTop()}>
            Retour
          </Button>
        </View>
      </GradientBackground>
    );
  }

  const currentPlayer = battle.players[battle.currentPlayerIndex];

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.topic}>
          {topic?.title}
        </Text>
        <TimerBar
          duration={TURN_DURATION}
          timeLeft={battle.turnTimeLeft}
        />
        <View style={styles.turn}>
          <PlayerAvatar avatarId={currentPlayer?.avatarId ?? 'avatar_1'} />
          <Text style={styles.turnText}>Tour de {currentPlayer?.name}</Text>
        </View>
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          placeholder="Votre réponse..."
          mode="outlined"
          style={styles.input}
          textColor={colors.text}
          onSubmitEditing={submitAnswer}
        />
        <Button mode="contained" onPress={submitAnswer} buttonColor={colors.primary}>
          Valider
        </Button>
        <Text style={styles.historyTitle}>Réponses utilisées</Text>
        <FlatList
          data={battle.usedAnswers}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <Text style={styles.historyItem}>• {item}</Text>
          )}
          style={styles.history}
        />
        <View style={styles.ranking}>
          {battle.players.map(p => (
            <Text
              key={p.id}
              style={[styles.rankItem, p.isEliminated && styles.eliminated]}>
              {p.isEliminated ? '✗' : '●'} {p.name}
            </Text>
          ))}
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  topic: { color: colors.accent, fontWeight: '700', marginBottom: spacing.md },
  turn: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: spacing.md },
  turnText: { color: colors.text, fontSize: 18, fontWeight: '600' },
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  historyTitle: { color: colors.textSecondary, marginTop: spacing.lg },
  history: { maxHeight: 120, marginTop: spacing.sm },
  historyItem: { color: colors.text, marginBottom: 4 },
  ranking: { marginTop: spacing.lg },
  rankItem: { color: colors.success, fontSize: 16, marginBottom: 4 },
  eliminated: { color: colors.error, textDecorationLine: 'line-through' },
  result: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  winner: { color: colors.accent, fontWeight: '800', marginBottom: spacing.xl },
});
