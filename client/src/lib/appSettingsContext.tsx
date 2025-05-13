import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface AppSettings {
  language: string;
  availability: 'available' | 'busy' | 'away';
  auto_reply_enabled: boolean;
  preferred_route_type: 'fastest' | 'greenest';
  notification_preferences: 'all' | 'important_only' | 'none';
  default_reply_message: string;
}

const defaultSettings: AppSettings = {
  language: 'en',
  availability: 'available',
  auto_reply_enabled: false,
  preferred_route_type: 'fastest',
  notification_preferences: 'all',
  default_reply_message: 'I will get back to you as soon as possible.'
};

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
});

export function useAppSettings() {
  return useContext(AppSettingsContext);
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from localStorage on first mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      try {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(storedSettings)
        });
      } catch (error) {
        console.error('Failed to parse app settings', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('appSettings');
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}