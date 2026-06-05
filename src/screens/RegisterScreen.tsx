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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = async () => {
    if (!pseudo.trim()) {
      Alert.alert('Erreur', 'Choisissez un pseudo');
      return;
    }
    if (userRepository.getUserByPseudo(pseudo.trim())) {
      Alert.alert('Erreur', 'Ce pseudo est déjà pris');
      return;
    }
    const user = userRepository.createUser(pseudo.trim(), false, email.trim() || undefined);
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
          Inscription
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
        <TextInput
          label="Email (optionnel)"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          style={styles.input}
          textColor={colors.text}
          outlineColor={colors.surfaceLight}
          activeOutlineColor={colors.accent}
        />
        <Button mode="contained" onPress={handleRegister} buttonColor={colors.primary}>
          Créer mon compte
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
  input: { marginBottom: spacing.md, backgroundColor: colors.surface },
  back: { marginTop: spacing.md },
});
