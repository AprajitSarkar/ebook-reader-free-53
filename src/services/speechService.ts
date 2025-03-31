
export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  isOnlineOnly: boolean;
  // Add missing SpeechSynthesisVoice properties
  voiceURI: string;
  lang: string;
  localService: boolean;
  default: boolean;
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
    
    // Force loading voices if needed (fixes issue on some mobile devices)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // On some mobile browsers, we need to wait for voices to load
      setTimeout(() => {
        speechService.speak(text, voice);
      }, 1000);
      return;
    }
    
    // Fix for Chrome on Android - utterance doesn't complete
    if (/Android/i.test(navigator.userAgent)) {
      // Chrome on Android bug workaround
      // Split very long text into smaller chunks
      if (text.length > 200) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        let i = 0;
        
        const speakNextSentence = () => {
          if (i < sentences.length) {
            const sentence = sentences[i++].trim();
            const shortUtterance = new SpeechSynthesisUtterance(sentence);
            if (voice) shortUtterance.voice = voice;
            shortUtterance.rate = 0.9;
            shortUtterance.pitch = 1.0;
            shortUtterance.onend = speakNextSentence;
            window.speechSynthesis.speak(shortUtterance);
          }
        };
        
        speakNextSentence();
        return;
      }
    }
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    
    // Fix for speech synthesis getting paused on mobile browsers when screen locks
    let resumeTimeout: number | null = null;
    
    const ensureSpeaking = () => {
      if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      
      if (window.speechSynthesis.speaking) {
        resumeTimeout = window.setTimeout(ensureSpeaking, 500);
      } else if (resumeTimeout) {
        window.clearTimeout(resumeTimeout);
      }
    };
    
    ensureSpeaking();
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
    
    // If no voices available, this might be because they're not loaded yet
    if (voices.length === 0) {
      console.log("No voices found, they may still be loading");
    }
    
    return voices.map(voice => ({
      id: voice.voiceURI,
      name: voice.name,
      gender: voice.name.toLowerCase().includes("female") ? "female" : "male",
      isOnlineOnly: !voice.localService,
      // Add missing SpeechSynthesisVoice properties
      voiceURI: voice.voiceURI,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default
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
  },
  
  // Helper method to check if speech synthesis is supported and working
  checkSupport: (): boolean => {
    const supported = 'speechSynthesis' in window;
    if (!supported) {
      console.error("Speech synthesis is not supported in this browser");
      return false;
    }
    
    // Some browsers may have the API but not working correctly
    try {
      const utterance = new SpeechSynthesisUtterance("test");
      return true;
    } catch (e) {
      console.error("Speech synthesis error:", e);
      return false;
    }
  }
};
