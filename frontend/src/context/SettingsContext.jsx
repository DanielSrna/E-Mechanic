import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/settings').then((r) => setSettings(r.data.settings)).catch((e) => console.error(e));
  }, [user]);

  const updateSettings = (newSettings) => setSettings(newSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
