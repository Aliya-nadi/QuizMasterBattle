import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Profile, User } from '../../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ user: User; profile: Profile } | null>) {
      if (action.payload) {
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      } else {
        state.user = null;
        state.profile = null;
      }
    },
    updateProfile(state, action: PayloadAction<Partial<Profile>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload;
    },
  },
});

export const { setUser, updateProfile, setLoading, setInitialized } = authSlice.actions;
export default authSlice.reducer;
