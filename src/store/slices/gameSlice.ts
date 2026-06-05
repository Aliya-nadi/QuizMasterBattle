import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BattlePlayer, QuizCategoryId } from '../../types';

interface SoloGameState {
  categoryId: QuizCategoryId | null;
  currentIndex: number;
  score: number;
  correctCount: number;
  startTime: number | null;
  isPlaying: boolean;
  bestScore: number;
}

interface BattleGameState {
  topicId: string | null;
  players: BattlePlayer[];
  currentPlayerIndex: number;
  usedAnswers: string[];
  turnTimeLeft: number;
  isPlaying: boolean;
}

interface RoyaleGameState {
  topicId: string | null;
  currentBid: number;
  bidderId: string | null;
  challengerId: string | null;
  phase: 'bidding' | 'proving' | 'result';
  isPlaying: boolean;
}

interface GameState {
  solo: SoloGameState;
  battle: BattleGameState;
  royale: RoyaleGameState;
}

const initialState: GameState = {
  solo: {
    categoryId: null,
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    startTime: null,
    isPlaying: false,
    bestScore: 0,
  },
  battle: {
    topicId: null,
    players: [],
    currentPlayerIndex: 0,
    usedAnswers: [],
    turnTimeLeft: 30,
    isPlaying: false,
  },
  royale: {
    topicId: null,
    currentBid: 0,
    bidderId: null,
    challengerId: null,
    phase: 'bidding',
    isPlaying: false,
  },
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startSolo(state, action: PayloadAction<{ categoryId: QuizCategoryId }>) {
      state.solo = {
        categoryId: action.payload.categoryId,
        currentIndex: 0,
        score: 0,
        correctCount: 0,
        startTime: Date.now(),
        isPlaying: true,
        bestScore: state.solo.bestScore,
      };
    },
    soloCorrectAnswer(state) {
      state.solo.score += 10;
      state.solo.correctCount += 1;
      state.solo.currentIndex += 1;
    },
    soloWrongAnswer(state) {
      state.solo.isPlaying = false;
      if (state.solo.score > state.solo.bestScore) {
        state.solo.bestScore = state.solo.score;
      }
    },
    endSolo(state) {
      state.solo.isPlaying = false;
      if (state.solo.score > state.solo.bestScore) {
        state.solo.bestScore = state.solo.score;
      }
    },
    resetSolo(state) {
      state.solo = { ...initialState.solo, bestScore: state.solo.bestScore };
    },
    startBattle(
      state,
      action: PayloadAction<{ topicId: string; players: BattlePlayer[] }>,
    ) {
      state.battle = {
        topicId: action.payload.topicId,
        players: action.payload.players,
        currentPlayerIndex: 0,
        usedAnswers: [],
        turnTimeLeft: 30,
        isPlaying: true,
      };
    },
    battleSubmitAnswer(state, action: PayloadAction<string>) {
      state.battle.usedAnswers.push(action.payload.toLowerCase().trim());
    },
    battleNextTurn(state) {
      const active = state.battle.players.filter(p => !p.isEliminated);
      if (active.length <= 1) {
        state.battle.isPlaying = false;
        return;
      }
      let next = (state.battle.currentPlayerIndex + 1) % state.battle.players.length;
      while (state.battle.players[next].isEliminated) {
        next = (next + 1) % state.battle.players.length;
      }
      state.battle.currentPlayerIndex = next;
      state.battle.turnTimeLeft = 30;
    },
    battleEliminatePlayer(state, action: PayloadAction<string>) {
      const player = state.battle.players.find(p => p.id === action.payload);
      if (player) {
        player.isEliminated = true;
      }
    },
    battleSetTimeLeft(state, action: PayloadAction<number>) {
      state.battle.turnTimeLeft = action.payload;
    },
    endBattle(state) {
      state.battle.isPlaying = false;
    },
    startRoyale(state, action: PayloadAction<{ topicId: string }>) {
      state.royale = {
        topicId: action.payload.topicId,
        currentBid: 0,
        bidderId: null,
        challengerId: null,
        phase: 'bidding',
        isPlaying: true,
      };
    },
    royalePlaceBid(
      state,
      action: PayloadAction<{ playerId: string; amount: number }>,
    ) {
      state.royale.currentBid = action.payload.amount;
      state.royale.bidderId = action.payload.playerId;
    },
    royaleStopBid(state, action: PayloadAction<{ challengerId: string }>) {
      state.royale.challengerId = action.payload.challengerId;
      state.royale.phase = 'proving';
    },
    royaleSetPhase(state, action: PayloadAction<'bidding' | 'proving' | 'result'>) {
      state.royale.phase = action.payload;
    },
    endRoyale(state) {
      state.royale.isPlaying = false;
    },
  },
});

export const {
  startSolo,
  soloCorrectAnswer,
  soloWrongAnswer,
  endSolo,
  resetSolo,
  startBattle,
  battleSubmitAnswer,
  battleNextTurn,
  battleEliminatePlayer,
  battleSetTimeLeft,
  endBattle,
  startRoyale,
  royalePlaceBid,
  royaleStopBid,
  royaleSetPhase,
  endRoyale,
} = gameSlice.actions;
export default gameSlice.reducer;
