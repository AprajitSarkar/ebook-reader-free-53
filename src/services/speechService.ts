
export interface VoiceOption {
  id: string;
  name: string;
  gender: "male" | "female";
}

export const speechService = {
  speak: (text: string, voice?: SpeechSynthesisVoice): void => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
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
      }
    }
    
    window.speechSynthesis.speak(utterance);
  },

  stop: (): void => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
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
        (nameLower.includes("f") && !nameLower.includes("male"))
      ) {
        gender = "female";
      }
      
      return {
        id: voice.voiceURI,
        name: voice.name,
        gender: gender
      };
    });
  }
};
