
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VoiceOption, speechService } from "@/services/speechService";

interface UserSettings {
  preferredVoice: VoiceOption | null;
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateVoice: (voice: VoiceOption | null) => void;
}

const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem("userSettings");
    return savedSettings ? JSON.parse(savedSettings) : {
      preferredVoice: null,
    };
  });

  // Set a female voice by default when voices are available
  useEffect(() => {
    const setDefaultFemaleVoice = () => {
      if (!settings.preferredVoice) {
        // Try to get preferred voices first (better quality)
        const preferredVoices = speechService.getPreferredVoices();
        const femaleVoice = preferredVoices.find(voice => voice.gender === "female");
        
        if (femaleVoice) {
          setSettings(prev => ({ ...prev, preferredVoice: femaleVoice }));
        } else {
          // Fall back to any female voice
          const allVoices = speechService.getVoices();
          const anyFemaleVoice = allVoices.find(voice => voice.gender === "female");
          
          if (anyFemaleVoice) {
            setSettings(prev => ({ ...prev, preferredVoice: anyFemaleVoice }));
          }
        }
      }
    };

    // Try to set immediately
    setDefaultFemaleVoice();

    // Also set up a listener for when voices are loaded asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = setDefaultFemaleVoice;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [settings.preferredVoice]);

  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [settings]);

  const updateVoice = (voice: VoiceOption | null) => {
    setSettings(prev => ({ ...prev, preferredVoice: voice }));
  };

  return (
    <UserSettingsContext.Provider value={{ settings, updateVoice }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error("useUserSettings must be used within a UserSettingsProvider");
  }
  return context;
};

export { UserSettingsProvider, useUserSettings };
