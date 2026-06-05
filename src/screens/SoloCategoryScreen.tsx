import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { GameCard } from '../components/GameCard';
import { colors, spacing } from '../constants/theme';
import { QUIZ_CATEGORIES } from '../constants/quizData';
import { MainStackParamList } from '../navigation/types';
import type { QuizCategoryId } from '../types';

type Props = NativeStackScreenProps<MainStackParamList, 'SoloCategory'>;

export function SoloCategoryScreen({ navigation }: Props) {
  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineSmall" style={styles.title}>
          Choisissez un thème
        </Text>
        {QUIZ_CATEGORIES.map((cat, i) => (
          <GameCard
            key={cat.id}
            title={cat.name}
            icon={cat.icon}
            iconColor={cat.color}
            delay={i * 80}
            onPress={() =>
              navigation.navigate('SoloGame', { categoryId: cat.id as QuizCategoryId })
            }
          />
        ))}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.lg },
});
