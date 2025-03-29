import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VoiceOption, speechService } from "@/services/speechService";

interface UserSettings {
  preferredVoice: VoiceOption | null;
  useOfflineVoice: boolean;
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateVoice: (voice: VoiceOption | null) => void;
  toggleOfflineMode: (enabled: boolean) => void;
}

const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem("userSettings");
    return savedSettings ? JSON.parse(savedSettings) : {
      preferredVoice: null,
      useOfflineVoice: false
    };
  });

  // Set a female voice by default when voices are available
  useEffect(() => {
    const setDefaultFemaleVoice = () => {
      if (!settings.preferredVoice) {
        // Try to get Google voices first if not in offline mode
        if (!settings.useOfflineVoice) {
          const googleVoices = speechService.getGoogleVoices();
          const femaleGoogleVoice = googleVoices.find(voice => voice.gender === "female");
          
          if (femaleGoogleVoice) {
            setSettings(prev => ({ ...prev, preferredVoice: femaleGoogleVoice }));
            return;
          }
        }
        
        // Otherwise, try preferred voices (better quality)
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
  }, [settings.preferredVoice, settings.useOfflineVoice]);

  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [settings]);

  const updateVoice = (voice: VoiceOption | null) => {
    setSettings(prev => ({ ...prev, preferredVoice: voice }));
  };
  
  const toggleOfflineMode = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, useOfflineVoice: enabled }));
    
    // If enabling offline mode, try to select an offline voice
    if (enabled) {
      const offlineVoices = speechService.getOfflineVoices();
      const femaleOfflineVoice = offlineVoices.find(voice => voice.gender === "female");
      
      if (femaleOfflineVoice) {
        setSettings(prev => ({ ...prev, preferredVoice: femaleOfflineVoice, useOfflineVoice: true }));
      }
    }
  };

  return (
    <UserSettingsContext.Provider value={{ settings, updateVoice, toggleOfflineMode }}>
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
