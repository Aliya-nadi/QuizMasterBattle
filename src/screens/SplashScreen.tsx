import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { LoadingBar } from '../components/LoadingBar';
import { colors, spacing } from '../constants/theme';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 8;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => navigation.replace('Welcome'), 400);
      return () => clearTimeout(t);
    }
  }, [progress, navigation]);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Animated.View entering={ZoomIn.duration(800)} style={styles.logoWrap}>
          <Icon name="sword-cross" size={72} color={colors.accent} />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(300)}>
          <Text variant="headlineLarge" style={styles.title}>
            QuizMaster
          </Text>
          <Text variant="titleLarge" style={styles.subtitle}>
            BATTLE
          </Text>
        </Animated.View>
        <View style={styles.loader}>
          <LoadingBar progress={progress} />
          <Text variant="bodySmall" style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.primary}44`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { color: colors.text, fontWeight: '900', textAlign: 'center' },
  subtitle: {
    color: colors.accent,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
  loader: { position: 'absolute', bottom: 80, width: '100%', alignItems: 'center' },
  loadingText: { color: colors.textSecondary, marginTop: spacing.sm },
});
