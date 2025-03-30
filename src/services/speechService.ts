export interface VoiceOption {
  id: string;
  name: string;
  gender: "male" | "female";
  lang?: string;
  isGoogleVoice?: boolean;
}

export const speechService = {
  speak: (text: string, voice?: VoiceOption | SpeechSynthesisVoice): void => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      // If it's a VoiceOption (our custom type)
      if ('id' in voice) {
        // Find the actual SpeechSynthesisVoice from browser
        const browserVoices = window.speechSynthesis.getVoices();
        const matchingVoice = browserVoices.find(v => v.voiceURI === voice.id);
        
        if (matchingVoice) {
          utterance.voice = matchingVoice;
          utterance.lang = matchingVoice.lang;
        }
      } else {
        // It's already a SpeechSynthesisVoice
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
    } else {
      // If no voice is provided, try to find a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes("female") || 
        v.name.toLowerCase().includes("woman") || 
        v.name.includes("f") ||
        v.name.toLowerCase().includes("girl")
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        utterance.lang = femaleVoice.lang;
      }
    }
    
    // Adjust properties for better speech quality
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    window.speechSynthesis.speak(utterance);
  },

  stop: (): void => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },

  onEnd: (callback: () => void): void => {
    if (!window.speechSynthesis) {
      return;
    }

    // Get all active utterances
    const utterances = window.speechSynthesis.getVoices();
    
    // Set up event listener for the end event
    if (utterances.length > 0) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.onend = () => {
        callback();
      };
      // We're not speaking this utterance, just using it for the callback
    } else {
      // If no utterances are active, call the callback directly
      setTimeout(callback, 100);
    }
  },

  getVoices: (): VoiceOption[] => {
    if (!window.speechSynthesis) {
      return [];
    }

    const systemVoices = window.speechSynthesis.getVoices();
    
    return systemVoices.map(voice => {
      // Determine gender - try to be more accurate
      let gender: "male" | "female" = "male";
      
      const nameLower = voice.name.toLowerCase();
      if (
        nameLower.includes("female") || 
        nameLower.includes("woman") || 
        nameLower.includes("girl") ||
        nameLower.includes("samantha") ||
        nameLower.includes("victoria") ||
        nameLower.includes("tessa") ||
        nameLower.includes("monica") ||
        nameLower.includes("kathy") ||
        nameLower.includes("karen") ||
        nameLower.includes("veena") ||
        nameLower.includes("fiona") ||
        nameLower.includes("lisa") ||
        nameLower.includes("laura") ||
        nameLower.includes("allison") ||
        (nameLower.includes("f") && !nameLower.includes("male"))
      ) {
        gender = "female";
      }
      
      // Check if it's a Google voice
      const isGoogleVoice = nameLower.includes("google");
      
      return {
        id: voice.voiceURI,
        name: voice.name,
        gender: gender,
        lang: voice.lang,
        isGoogleVoice: isGoogleVoice
      };
    });
  },
  
  getPreferredVoices: (): VoiceOption[] => {
    const allVoices = speechService.getVoices();
    
    // Filter to get more widely available voices
    const preferredVoices = allVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      // Include common Google and system voices
      return (
        name.includes("google") || 
        name.includes("samantha") || 
        name.includes("victoria") || 
        name.includes("english") ||
        name.includes("us ") ||
        name.includes("uk ")
      );
    });
    
    // Sort by gender to put female voices first, then Google voices second
    return preferredVoices.sort((a, b) => {
      if (a.gender === "female" && b.gender === "male") return -1;
      if (a.gender === "male" && b.gender === "female") return 1;
      if (a.isGoogleVoice && !b.isGoogleVoice) return -1;
      if (!a.isGoogleVoice && b.isGoogleVoice) return 1;
      return 0;
    });
  },
  
  getGoogleVoices: (): VoiceOption[] => {
    const allVoices = speechService.getVoices();
    
    // Filter to get only Google voices
    const googleVoices = allVoices.filter(voice => 
      voice.name.toLowerCase().includes("google")
    );
    
    // Sort by gender to put female voices first
    return googleVoices.sort((a, b) => {
      if (a.gender === "female" && b.gender === "male") return -1;
      if (a.gender === "male" && b.gender === "female") return 1;
      return 0;
    });
  },
  
  getOfflineVoices: (): VoiceOption[] => {
    const allVoices = speechService.getVoices();
    
    // Filter to get non-network voices that should work offline
    const offlineVoices = allVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      // Most built-in voices should work offline (non-Google, non-remote)
      return !name.includes("google") && !name.includes("remote");
    });
    
    // Sort by gender to put female voices first
    return offlineVoices.sort((a, b) => {
      if (a.gender === "female" && b.gender === "male") return -1;
      if (a.gender === "male" && b.gender === "female") return 1;
      return 0;
    });
  }
};
