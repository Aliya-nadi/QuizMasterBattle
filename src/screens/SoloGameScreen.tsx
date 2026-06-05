import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { colors, spacing } from '../constants/theme';
import { quizRepository } from '../database/repositories/quizRepository';
import { profileService } from '../services/profileService';
import { MainStackParamList } from '../navigation/types';
import { RootState } from '../store';
import {
  endSolo,
  soloCorrectAnswer,
  soloWrongAnswer,
  startSolo,
} from '../store/slices/gameSlice';
import { updateProfile } from '../store/slices/authSlice';
import { userRepository } from '../database/repositories/userRepository';
import { formatDuration } from '../utils/gameLogic';

type Props = NativeStackScreenProps<MainStackParamList, 'SoloGame'>;

export function SoloGameScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const dispatch = useDispatch();
  const { user, profile } = useSelector((s: RootState) => s.auth);
  const solo = useSelector((s: RootState) => s.game.solo);
  const [showConfetti, setShowConfetti] = useState(false);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => quizRepository.getQuestionsByCategory(categoryId), [categoryId]);

  React.useEffect(() => {
    dispatch(startSolo({ categoryId }));
  }, [categoryId, dispatch]);

  const currentQ = questions[solo.currentIndex];
  const duration =
    solo.startTime ? Math.floor((Date.now() - solo.startTime) / 1000) : 0;

  const handleAnswer = (index: number) => {
    if (!currentQ || finished) {
      return;
    }
    if (index === currentQ.correctIndex) {
      if (solo.currentIndex + 1 >= questions.length) {
        finishGame(true, solo.correctCount + 1, solo.score + 10);
      } else {
        dispatch(soloCorrectAnswer());
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
    } else {
      dispatch(soloWrongAnswer());
      finishGame(false, solo.correctCount, solo.score);
    }
  };

  const finishGame = (won: boolean, correct: number, score: number) => {
    setFinished(true);
    dispatch(endSolo());
    if (user) {
      profileService.recordGameResult(user.id, 'solo', {
        categoryId,
        score,
        correctAnswers: correct,
        durationSeconds: duration,
        won,
      });
      const updated = userRepository.getProfile(user.id);
      if (updated) {
        dispatch(updateProfile(updated));
      }
    }
  };

  if (finished) {
    return (
      <GradientBackground>
        <ConfettiEffect visible={solo.correctCount === questions.length} />
        <View style={styles.result}>
          <Text variant="headlineMedium" style={styles.resultTitle}>
            Partie terminée
          </Text>
          <Text style={styles.resultStat}>Score : {solo.score}</Text>
          <Text style={styles.resultStat}>Bonnes réponses : {solo.correctCount}</Text>
          <Text style={styles.resultStat}>Temps : {formatDuration(duration)}</Text>
          <Text style={styles.resultStat}>Meilleur score : {solo.bestScore}</Text>
          <Button mode="contained" onPress={() => navigation.popToTop()} style={styles.btn}>
            Retour
          </Button>
        </View>
      </GradientBackground>
    );
  }

  if (!currentQ) {
    return (
      <GradientBackground>
        <View style={styles.result}>
          <Text style={styles.resultStat}>Aucune question disponible</Text>
          <Button onPress={() => navigation.goBack()}>Retour</Button>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ConfettiEffect visible={showConfetti} />
      <View style={styles.container}>
        <Text style={styles.progress}>
          Question {solo.currentIndex + 1}/{questions.length}
        </Text>
        <Text style={styles.score}>Score : {solo.score}</Text>
        <Text variant="titleLarge" style={styles.question}>
          {currentQ.question}
        </Text>
        {currentQ.options.map((opt, idx) => (
          <Button
            key={idx}
            mode="outlined"
            onPress={() => handleAnswer(idx)}
            style={styles.option}
            textColor={colors.text}>
            {opt}
          </Button>
        ))}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  progress: { color: colors.textSecondary, marginBottom: spacing.sm },
  score: { color: colors.accent, fontWeight: '700', marginBottom: spacing.lg },
  question: { color: colors.text, marginBottom: spacing.xl, fontWeight: '600' },
  option: { marginBottom: spacing.sm, borderColor: colors.surfaceLight },
  result: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  resultTitle: { color: colors.text, fontWeight: '800', marginBottom: spacing.lg },
  resultStat: { color: colors.textSecondary, fontSize: 18, marginBottom: spacing.sm },
  btn: { marginTop: spacing.xl },
});
