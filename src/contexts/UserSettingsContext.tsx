
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
        console.log("Setting default voice - current voices count:", speechService.getVoices().length);
        
        // Try to get Google voices first if not in offline mode
        if (!settings.useOfflineVoice) {
          const googleVoices = speechService.getGoogleVoices();
          const femaleGoogleVoice = googleVoices.find(voice => voice.gender === "female");
          
          if (femaleGoogleVoice) {
            console.log("Setting Google female voice:", femaleGoogleVoice.name);
            setSettings(prev => ({ ...prev, preferredVoice: femaleGoogleVoice }));
            return;
          }
        }
        
        // Otherwise, try preferred voices (better quality)
        const preferredVoices = speechService.getPreferredVoices();
        const femaleVoice = preferredVoices.find(voice => voice.gender === "female");
        
        if (femaleVoice) {
          console.log("Setting preferred female voice:", femaleVoice.name);
          setSettings(prev => ({ ...prev, preferredVoice: femaleVoice }));
        } else {
          // Fall back to any female voice
          const allVoices = speechService.getVoices();
          const anyFemaleVoice = allVoices.find(voice => voice.gender === "female");
          
          if (anyFemaleVoice) {
            console.log("Setting any female voice:", anyFemaleVoice.name);
            setSettings(prev => ({ ...prev, preferredVoice: anyFemaleVoice }));
          } else if (allVoices.length > 0) {
            // Fall back to first available voice if no female voice is found
            console.log("No female voices found, using first available voice:", allVoices[0].name);
            setSettings(prev => ({ ...prev, preferredVoice: allVoices[0] }));
          }
        }
      }
    };

    // Try to set immediately
    setDefaultFemaleVoice();

    // Also set up a listener for when voices are loaded asynchronously
    if (window.speechSynthesis) {
      // Add multiple attempts to load voices on mobile
      let attempts = 0;
      const maxAttempts = 5;
      
      const tryLoadingVoices = () => {
        const voices = speechService.getVoices();
        if (voices.length > 0) {
          setDefaultFemaleVoice();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryLoadingVoices, 1000);
        }
      };
      
      window.speechSynthesis.onvoiceschanged = () => {
        console.log("Voices changed event fired");
        setDefaultFemaleVoice();
      };
      
      // Start attempting to load voices
      tryLoadingVoices();
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
    console.log("Updating voice to:", voice?.name || "null");
    setSettings(prev => ({ ...prev, preferredVoice: voice }));
  };
  
  const toggleOfflineMode = (enabled: boolean) => {
    console.log("Setting offline mode to:", enabled);
    setSettings(prev => ({ ...prev, useOfflineVoice: enabled }));
    
    // If enabling offline mode, try to select an offline voice
    if (enabled) {
      const offlineVoices = speechService.getOfflineVoices();
      console.log("Available offline voices:", offlineVoices.length);
      
      const femaleOfflineVoice = offlineVoices.find(voice => voice.gender === "female");
      
      if (femaleOfflineVoice) {
        console.log("Setting offline female voice:", femaleOfflineVoice.name);
        setSettings(prev => ({ ...prev, preferredVoice: femaleOfflineVoice, useOfflineVoice: true }));
      } else if (offlineVoices.length > 0) {
        console.log("No female offline voice found, using first available:", offlineVoices[0].name);
        setSettings(prev => ({ ...prev, preferredVoice: offlineVoices[0], useOfflineVoice: true }));
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
