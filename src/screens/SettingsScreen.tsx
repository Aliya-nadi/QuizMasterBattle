import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { List, Switch, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { colors, spacing } from '../constants/theme';
import { MainStackParamList } from '../navigation/types';
import { RootState } from '../store';
import { patchSettings } from '../store/slices/settingsSlice';
import { settingsRepository } from '../database/repositories/settingsRepository';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

export function SettingsScreen({}: Props) {
  const dispatch = useDispatch();
  const settings = useSelector((s: RootState) => s.settings);
  const { user } = useSelector((s: RootState) => s.auth);

  const update = (patch: Partial<typeof settings>) => {
    dispatch(patchSettings(patch));
    if (user) {
      settingsRepository.updateSettings(user.id, patch);
    }
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineSmall" style={styles.title}>
          Paramètres
        </Text>
        <List.Section>
          <List.Subheader style={styles.subheader}>Apparence</List.Subheader>
          <List.Item
            title="Mode sombre"
            titleStyle={styles.itemTitle}
            right={() => (
              <Switch
                value={settings.darkMode}
                onValueChange={v => update({ darkMode: v })}
              />
            )}
          />
          <List.Subheader style={styles.subheader}>Audio</List.Subheader>
          <List.Item
            title="Musique"
            titleStyle={styles.itemTitle}
            right={() => (
              <Switch value={settings.music} onValueChange={v => update({ music: v })} />
            )}
          />
          <List.Item
            title="Effets sonores"
            titleStyle={styles.itemTitle}
            right={() => (
              <Switch
                value={settings.soundEffects}
                onValueChange={v => update({ soundEffects: v })}
              />
            )}
          />
          <List.Subheader style={styles.subheader}>Notifications</List.Subheader>
          <List.Item
            title="Notifications"
            titleStyle={styles.itemTitle}
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={v => update({ notifications: v })}
              />
            )}
          />
          <List.Subheader style={styles.subheader}>Langue</List.Subheader>
          <List.Item
            title={settings.language === 'fr' ? 'Français' : 'English'}
            description="Appuyez pour changer"
            titleStyle={styles.itemTitle}
            onPress={() => update({ language: settings.language === 'fr' ? 'en' : 'fr' })}
          />
        </List.Section>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.lg },
  subheader: { color: colors.accent },
  itemTitle: { color: colors.text },
});
