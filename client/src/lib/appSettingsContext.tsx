import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface AppSettings {
  language: string;
  availability: 'available' | 'busy' | 'away';
  auto_reply_enabled: boolean;
  preferred_route_type: 'fastest' | 'greenest';
  notification_preferences: 'all' | 'important_only' | 'none';
  default_reply_message: string;
  assistantName: string;
}

const defaultSettings: AppSettings = {
  language: 'en',
  availability: 'available',
  auto_reply_enabled: false,
  preferred_route_type: 'fastest',
  notification_preferences: 'all',
  default_reply_message: 'I will get back to you as soon as possible.',
  assistantName: 'Assistant'
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

// Map full language names to ISO codes
const languageNameToCode: Record<string, string> = {
  'english': 'en',
  'spanish': 'es',
  'french': 'fr',
  'german': 'de',
  'chinese': 'zh',
  'japanese': 'ja'
};

// Map ISO codes to full language names
export const languageCodeToName: Record<string, string> = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français', 
  'de': 'Deutsch',
  'zh': '中文',
  'ja': '日本語'
};

// Helper function to normalize language codes (handle full names, case insensitivity)
const normalizeLanguageCode = (language: string): string => {
  // If it's already a supported ISO code, return it
  if (Object.keys(languageCodeToName).includes(language.toLowerCase())) {
    return language.toLowerCase();
  }
  
  // Check if it's a full language name and convert to code
  const lowerCaseLang = language.toLowerCase();
  if (languageNameToCode[lowerCaseLang]) {
    return languageNameToCode[lowerCaseLang];
  }
  
  // Default to English if not recognized
  console.warn(`Unrecognized language: ${language}, defaulting to English`);
  return 'en';
};

// Helper function to apply language setting to the HTML document
const applyLanguageToDocument = (language: string) => {
  // Normalize the language code
  const normalizedCode = normalizeLanguageCode(language);
  
  // Apply language code to HTML document for accessibility and localization
  document.documentElement.lang = normalizedCode;
  document.documentElement.setAttribute('data-language', normalizedCode);
  
  console.log(`Applied language: ${normalizedCode} to document`);
  
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
    
    // Create a copy of the new settings to normalize values
    const normalizedSettings = { ...newSettings };
    
    // If language is being updated, normalize it to a proper ISO code
    if (normalizedSettings.language) {
      const originalLang = normalizedSettings.language;
      normalizedSettings.language = normalizeLanguageCode(normalizedSettings.language);
      console.log(`Normalized language from "${originalLang}" to "${normalizedSettings.language}"`);
    }
    
    setSettings(prev => ({
      ...prev,
      ...normalizedSettings
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