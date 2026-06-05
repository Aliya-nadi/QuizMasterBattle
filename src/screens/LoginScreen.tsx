import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { colors, spacing } from '../constants/theme';
import { AuthStackParamList } from '../navigation/types';
import { userRepository } from '../database/repositories/userRepository';
import { setStoredUserId } from '../database/init';
import { setUser } from '../store/slices/authSlice';
import { settingsRepository } from '../database/repositories/settingsRepository';
import { setSettings } from '../store/slices/settingsSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [pseudo, setPseudo] = useState('');

  const handleLogin = async () => {
    if (!pseudo.trim()) {
      Alert.alert('Erreur', 'Entrez votre pseudo');
      return;
    }
    const user = userRepository.getUserByPseudo(pseudo.trim());
    if (!user) {
      Alert.alert('Erreur', 'Joueur introuvable. Inscrivez-vous.');
      return;
    }
    const profile = userRepository.getProfile(user.id)!;
    await setStoredUserId(user.id);
    dispatch(setUser({ user, profile }));
    dispatch(setSettings(settingsRepository.getSettings(user.id)));
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Main' as never }] });
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Connexion
        </Text>
        <TextInput
          label="Pseudo"
          value={pseudo}
          onChangeText={setPseudo}
          mode="outlined"
          style={styles.input}
          textColor={colors.text}
          outlineColor={colors.surfaceLight}
          activeOutlineColor={colors.accent}
        />
        <Button mode="contained" onPress={handleLogin} buttonColor={colors.primary}>
          Se connecter
        </Button>
        <Button onPress={() => navigation.goBack()} style={styles.back}>
          Retour
        </Button>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  title: { color: colors.text, marginBottom: spacing.lg, fontWeight: '700' },
  input: { marginBottom: spacing.lg, backgroundColor: colors.surface },
  back: { marginTop: spacing.md },
});
