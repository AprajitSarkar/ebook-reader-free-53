
export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  isOnlineOnly: boolean;
}

export const speechService = {
  speak: (text: string, voice: SpeechSynthesisVoice | null = null) => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return;
    }
    
    // Stop any existing speech
    window.speechSynthesis.cancel();
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set the voice if provided
    if (voice) {
      utterance.voice = voice;
    }
    
    // Set rate and pitch for better readability
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  },
  
  stop: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },
  
  pause: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  },
  
  resume: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  },
  
  getVoices: (): VoiceOption[] => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return [];
    }
    
    const voices = window.speechSynthesis.getVoices();
    
    return voices.map(voice => ({
      id: voice.voiceURI,
      name: voice.name,
      gender: voice.name.toLowerCase().includes("female") ? "female" : "male",
      isOnlineOnly: !voice.localService
    }));
  },
  
  getPreferredVoices: (): VoiceOption[] => {
    const allVoices = speechService.getVoices();
    // Prefer higher quality voices or ones that are explicitly marked as good quality
    const preferredVoices = allVoices.filter(voice => 
      voice.name.toLowerCase().includes("enhanced") || 
      voice.name.toLowerCase().includes("premium") ||
      voice.name.toLowerCase().includes("neural") ||
      voice.name.toLowerCase().includes("wavenet")
    );
    
    return preferredVoices;
  },
  
  getGoogleVoices: (): VoiceOption[] => {
    const allVoices = speechService.getVoices();
    return allVoices.filter(voice => voice.name.toLowerCase().includes("google"));
  },
  
  getOfflineVoices: (): VoiceOption[] => {
    const allVoices = speechService.getVoices();
    return allVoices.filter(voice => !voice.isOnlineOnly);
  },
  
  onEnd: (callback: () => void) => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return;
    }
    
    const checkInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(checkInterval);
        callback();
      }
    }, 100);
  }
};
