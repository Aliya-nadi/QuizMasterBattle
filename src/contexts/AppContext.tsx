import React, { createContext, useContext } from 'react';

interface AppContextValue {
  isOnline: boolean;
}

const AppContext = createContext<AppContextValue>({ isOnline: true });

export function AppProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: AppContextValue;
}) {
  return <AppContext.Provider value={value ?? { isOnline: true }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
