import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { initializeDatabase, getStoredUserId } from '../database/init';
import { userRepository } from '../database/repositories/userRepository';
import { settingsRepository } from '../database/repositories/settingsRepository';
import { setUser, setInitialized, setLoading } from '../store/slices/authSlice';
import { setSettings } from '../store/slices/settingsSlice';

export function useAppInit() {
  const dispatch = useDispatch();
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await initializeDatabase();
        if (!mounted) {
          return;
        }
        setDbReady(true);
        const userId = await getStoredUserId();
        if (userId) {
          const user = userRepository.getUserById(userId);
          const profile = user ? userRepository.getProfile(userId) : null;
          if (user && profile) {
            dispatch(setUser({ user, profile }));
            dispatch(setSettings(settingsRepository.getSettings(userId)));
          }
        }
        dispatch(setInitialized(true));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur initialisation');
      } finally {
        dispatch(setLoading(false));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return { dbReady, error };
}
