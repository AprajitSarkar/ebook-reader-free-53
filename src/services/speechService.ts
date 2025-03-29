
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
    
    return systemVoices.map(voice => ({
      id: voice.voiceURI,
      name: voice.name,
      gender: voice.name.toLowerCase().includes("female") ? "female" : "male"
    }));
  }
};
