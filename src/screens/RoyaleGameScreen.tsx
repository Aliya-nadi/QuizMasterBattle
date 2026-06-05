import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { colors, spacing } from '../constants/theme';
import { BATTLE_TOPICS } from '../constants/quizData';
import { MainStackParamList } from '../navigation/types';
import { RootState } from '../store';
import {
  endRoyale,
  royalePlaceBid,
  royaleSetPhase,
  royaleStopBid,
  startRoyale,
} from '../store/slices/gameSlice';
import { validateRoyaleAnswers } from '../utils/gameLogic';
import { historyRepository } from '../database/repositories/historyRepository';

type Props = NativeStackScreenProps<MainStackParamList, 'RoyaleGame'>;

export function RoyaleGameScreen({ navigation, route }: Props) {
  const { topicId } = route.params;
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const royale = useSelector((s: RootState) => s.game.royale);
  const [bidInput, setBidInput] = useState('');
  const [proofAnswers, setProofAnswers] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const topic = BATTLE_TOPICS.find(t => t.id === topicId);

  React.useEffect(() => {
    dispatch(startRoyale({ topicId }));
  }, [dispatch, topicId]);

  const placeBid = () => {
    const amount = parseInt(bidInput, 10);
    if (isNaN(amount) || amount <= royale.currentBid) {
      Alert.alert('Enchère invalide', `Doit être supérieur à ${royale.currentBid}`);
      return;
    }
    dispatch(royalePlaceBid({ playerId: 'player_a', amount }));
    setBidInput('');
  };

  const stopBidding = () => {
    dispatch(royaleStopBid({ challengerId: 'player_b' }));
    dispatch(royaleSetPhase('proving'));
  };

  const submitProof = () => {
    const answers = proofAnswers.split('\n').map(a => a.trim()).filter(Boolean);
    const result = validateRoyaleAnswers(topicId, answers, royale.currentBid);
    dispatch(royaleSetPhase('result'));
    dispatch(endRoyale());
    if (user) {
      historyRepository.addRoyaleHistory(user.id, {
        topicId,
        bidAmount: royale.currentBid,
        won: result.success,
        answersCount: result.validCount,
      });
    }
    if (result.success) {
      setShowConfetti(true);
      Alert.alert('Victoire !', `${result.validCount} réponses valides sur ${royale.currentBid}`);
    } else {
      Alert.alert('Défaite', `Seulement ${result.validCount}/${royale.currentBid} réponses valides`);
    }
  };

  return (
    <GradientBackground>
      <ConfettiEffect visible={showConfetti} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineSmall" style={styles.title}>
          {topic?.title}
        </Text>
        {royale.phase === 'bidding' && (
          <>
            <Text style={styles.phase}>Phase d'enchères</Text>
            <Text style={styles.bid}>Enchère actuelle : {royale.currentBid}</Text>
            <TextInput
              label="Je peux en citer..."
              value={bidInput}
              onChangeText={setBidInput}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
              textColor={colors.text}
            />
            <Button mode="contained" onPress={placeBid} style={styles.btn}>
              Enchérir
            </Button>
            <Button mode="outlined" onPress={stopBidding} style={styles.btn}>
              Je m'arrête
            </Button>
          </>
        )}
        {royale.phase === 'proving' && (
          <>
            <Text style={styles.phase}>
              Prouvez {royale.currentBid} réponses (une par ligne)
            </Text>
            <TextInput
              value={proofAnswers}
              onChangeText={setProofAnswers}
              multiline
              numberOfLines={10}
              mode="outlined"
              style={[styles.input, styles.multiline]}
              textColor={colors.text}
            />
            <Button mode="contained" buttonColor={colors.warning} onPress={submitProof}>
              Valider
            </Button>
          </>
        )}
        {royale.phase === 'result' && (
          <Button onPress={() => navigation.popToTop()}>Retour</Button>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.lg },
  phase: { color: colors.accent, fontSize: 16, marginBottom: spacing.md },
  bid: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.lg },
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  multiline: { minHeight: 200 },
  btn: { marginBottom: spacing.sm },
});
