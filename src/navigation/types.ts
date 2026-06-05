import type { BattlePlayer, QuizCategoryId } from '../types';

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  SoloCategory: undefined;
  SoloGame: { categoryId: QuizCategoryId };
  BattleLobby: undefined;
  BattleGame: {
    topicId: string;
    players: BattlePlayer[];
    connection?: string;
  };
  RoyaleLobby: undefined;
  RoyaleGame: { topicId: string };
  Profile: undefined;
  Settings: undefined;
  History: undefined;
  MultiplayerConnect: {
    mode: 'battle' | 'royale';
    type: 'bluetooth' | 'wifi' | 'online';
  };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
