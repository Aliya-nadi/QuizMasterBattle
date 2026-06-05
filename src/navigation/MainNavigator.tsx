import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SoloCategoryScreen } from '../screens/SoloCategoryScreen';
import { SoloGameScreen } from '../screens/SoloGameScreen';
import { BattleLobbyScreen } from '../screens/BattleLobbyScreen';
import { BattleGameScreen } from '../screens/BattleGameScreen';
import { RoyaleLobbyScreen } from '../screens/RoyaleLobbyScreen';
import { RoyaleGameScreen } from '../screens/RoyaleGameScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { MultiplayerConnectScreen } from '../screens/MultiplayerConnectScreen';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'QuizMaster Battle', headerShown: false }}
      />
      <Stack.Screen name="SoloCategory" component={SoloCategoryScreen} options={{ title: 'Mode Solo' }} />
      <Stack.Screen name="SoloGame" component={SoloGameScreen} options={{ title: 'Quiz', headerBackVisible: true }} />
      <Stack.Screen name="BattleLobby" component={BattleLobbyScreen} options={{ title: 'Battle' }} />
      <Stack.Screen name="BattleGame" component={BattleGameScreen} options={{ title: 'Partie Battle', headerShown: false }} />
      <Stack.Screen name="RoyaleLobby" component={RoyaleLobbyScreen} options={{ title: 'Battle Royale' }} />
      <Stack.Screen name="RoyaleGame" component={RoyaleGameScreen} options={{ title: 'Enchères', headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
      <Stack.Screen name="MultiplayerConnect" component={MultiplayerConnectScreen} options={{ title: 'Multijoueur' }} />
    </Stack.Navigator>
  );
}
