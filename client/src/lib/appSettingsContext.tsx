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
  applyLanguage: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
  applyLanguage: () => {},
});

// Helper function to apply language setting to the HTML document
const applyLanguageToDocument = (language: string) => {
  // Apply language code to HTML document for accessibility and localization
  document.documentElement.lang = language;
  console.log(`Applied language: ${language} to document`);
  
  // You might also want to update other language-specific elements here
  // like date formats, currency symbols, or loading translations
};

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
        const parsedSettings = {
          ...defaultSettings,
          ...JSON.parse(storedSettings)
        };
        setSettings(parsedSettings);
        
        // Apply language on initial load
        applyLanguageToDocument(parsedSettings.language);
      } catch (error) {
        console.error('Failed to parse app settings', error);
      }
    } else {
      // Apply default language if no stored settings
      applyLanguageToDocument(defaultSettings.language);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Apply language setting whenever language changes
    applyLanguageToDocument(settings.language);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    console.log('Updating settings:', newSettings);
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('appSettings');
  };
  
  const applyLanguage = () => {
    applyLanguageToDocument(settings.language);
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, resetSettings, applyLanguage }}>
      {children}
    </AppSettingsContext.Provider>
  );
}