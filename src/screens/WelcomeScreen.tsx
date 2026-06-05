import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { GradientBackground } from '../components/GradientBackground';
import { colors, spacing } from '../constants/theme';
import { AuthStackParamList } from '../navigation/types';
import { RootState } from '../store';
import { userRepository } from '../database/repositories/userRepository';
import { setStoredUserId } from '../database/init';
import { setUser } from '../store/slices/authSlice';
import { settingsRepository } from '../database/repositories/settingsRepository';
import { setSettings } from '../store/slices/settingsSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);

  const continueAsGuest = async () => {
    const guestName = `Joueur_${Math.floor(Math.random() * 9000) + 1000}`;
    const newUser = userRepository.createUser(guestName, true);
    const profile = userRepository.getProfile(newUser.id)!;
    await setStoredUserId(newUser.id);
    dispatch(setUser({ user: newUser, profile }));
    dispatch(setSettings(settingsRepository.getSettings(newUser.id)));
  };

  useEffect(() => {
    if (user) {
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    }
  }, [user, navigation]);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Animated.View entering={FadeInUp}>
          <Text variant="headlineMedium" style={styles.title}>
            Bienvenue !
          </Text>
          <Text variant="bodyLarge" style={styles.desc}>
            Affrontez vos amis dans des quiz épiques
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.buttons}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.btn}
            buttonColor={colors.primary}>
            Connexion
          </Button>
          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate('Register')}
            style={styles.btn}>
            Inscription
          </Button>
          <Button mode="outlined" onPress={continueAsGuest} style={styles.btn} textColor={colors.accent}>
            Continuer en invité
          </Button>
        </Animated.View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: { color: colors.text, fontWeight: '800', marginBottom: spacing.sm },
  desc: { color: colors.textSecondary, marginBottom: spacing.xxl },
  buttons: { gap: spacing.md },
  btn: { borderRadius: 12 },
});
