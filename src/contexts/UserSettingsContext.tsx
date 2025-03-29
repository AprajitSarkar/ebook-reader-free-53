
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VoiceOption } from "@/services/speechService";

interface UserSettings {
  preferredLanguage: string;
  preferredVoice: VoiceOption | null;
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateLanguage: (language: string) => void;
  updateVoice: (voice: VoiceOption | null) => void;
}

const defaultSettings: UserSettings = {
  preferredLanguage: "en",
  preferredVoice: null,
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem("userSettings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [settings]);

  const updateLanguage = (language: string) => {
    setSettings(prev => ({ ...prev, preferredLanguage: language }));
  };

  const updateVoice = (voice: VoiceOption | null) => {
    setSettings(prev => ({ ...prev, preferredVoice: voice }));
  };

  return (
    <UserSettingsContext.Provider value={{ settings, updateLanguage, updateVoice }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error("useUserSettings must be used within a UserSettingsProvider");
  }
  return context;
};
