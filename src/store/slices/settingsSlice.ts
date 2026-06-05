import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppSettings } from '../../types';

const initialState: AppSettings = {
  darkMode: true,
  music: true,
  soundEffects: true,
  notifications: true,
  language: 'fr',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(_state, action: PayloadAction<AppSettings>) {
      return action.payload;
    },
    patchSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setSettings, patchSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
