
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
      console.log("Using voice:", voice.name);
    } else {
      // If no voice specified, try to use a default one
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices[0];
        console.log("Using fallback voice:", voices[0].name);
      }
    }
    
    // Set rate and pitch for better readability
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    // Force trying to speak even if voices aren't loaded yet
    const tryToSpeak = () => {
      // For Android, we need a special workaround
      if (/Android/i.test(navigator.userAgent)) {
        console.log("Android device detected, using chunked speaking");
        // Chrome on Android bug workaround
        if (text.length > 200) {
          const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
          let i = 0;
          
          // Log some debug info
          console.log(`Breaking text into ${sentences.length} chunks for Android`);
          
          const speakNextSentence = () => {
            if (i < sentences.length) {
              const sentence = sentences[i++].trim();
              const shortUtterance = new SpeechSynthesisUtterance(sentence);
              if (voice) {
                shortUtterance.voice = voice;
                console.log(`Speaking chunk ${i} with voice ${voice.name}`);
              } else {
                // Try to get the current available voices
                const availableVoices = window.speechSynthesis.getVoices();
                if (availableVoices.length > 0) {
                  shortUtterance.voice = availableVoices[0];
                  console.log(`Speaking chunk ${i} with fallback voice ${availableVoices[0].name}`);
                }
              }
              shortUtterance.rate = 0.9;
              shortUtterance.pitch = 1.0;
              shortUtterance.onend = speakNextSentence;
              
              // For debugging
              shortUtterance.onstart = () => console.log(`Started speaking chunk ${i}`);
              shortUtterance.onerror = (e) => console.error(`Error speaking chunk ${i}:`, e);
              
              window.speechSynthesis.speak(shortUtterance);
            }
          };
          
          speakNextSentence();
          return;
        }
      }
      
      // For other browsers
      console.log("Speaking with voice:", utterance.voice?.name || "default system voice");
      
      // Add event listeners for debugging
      utterance.onstart = () => console.log("Speech started");
      utterance.onend = () => console.log("Speech ended");
      utterance.onerror = (e) => console.error("Speech error:", e);
      
      window.speechSynthesis.speak(utterance);
    };
    
    // Check if voices are loaded
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      console.log("No voices loaded yet, waiting for voices to load");
      // If voices aren't loaded yet, wait for them
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          console.log("Voices loaded, trying to speak now");
          window.speechSynthesis.onvoiceschanged = null;
          tryToSpeak();
        };
        
        // Fallback if the event never fires (some browsers)
        setTimeout(() => {
          if (window.speechSynthesis.getVoices().length > 0) {
            console.log("Voices loaded via timeout, speaking now");
            tryToSpeak();
          } else {
            console.log("Still no voices available after timeout, trying anyway");
            tryToSpeak();
          }
        }, 1000);
      } else {
        // If the browser doesn't support onvoiceschanged, just try to speak
        console.log("Browser doesn't support onvoiceschanged, trying to speak anyway");
        tryToSpeak();
      }
    } else {
      console.log(`${voices.length} voices already loaded, speaking directly`);
      tryToSpeak();
    }
    
    // Fix for speech synthesis getting paused on mobile browsers when screen locks
    let resumeTimeout: number | null = null;
    
    const ensureSpeaking = () => {
      if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        console.log("Speech was paused, resuming");
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
      console.log("Speech stopped");
    }
  },
  
  pause: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      console.log("Speech paused");
    }
  },
  
  resume: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      console.log("Speech resumed");
    }
  },
  
  getVoices: (): VoiceOption[] => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return [];
    }
    
    const voices = window.speechSynthesis.getVoices();
    console.log(`Retrieved ${voices.length} voices:`, voices.map(v => v.name).join(", "));
    
    // If no voices available, this might be because they're not loaded yet
    if (voices.length === 0) {
      console.log("No voices found, they may still be loading");
    }
    
    // Force a voice refresh on Android (sometimes they're available but not reported)
    if (/Android/i.test(navigator.userAgent) && voices.length === 0) {
      console.log("On Android with no voices, trying workaround");
      const dummyUtterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(dummyUtterance);
      window.speechSynthesis.cancel();
      
      // Try again
      const retryVoices = window.speechSynthesis.getVoices();
      console.log("After Android workaround, found voices:", retryVoices.length);
      if (retryVoices.length > 0) {
        return retryVoices.map(voice => ({
          id: voice.voiceURI,
          name: voice.name,
          gender: voice.name.toLowerCase().includes("female") ? "female" : "male",
          isOnlineOnly: !voice.localService,
          voiceURI: voice.voiceURI,
          lang: voice.lang,
          localService: voice.localService,
          default: voice.default
        }));
      }
    }
    
    return voices.map(voice => ({
      id: voice.voiceURI,
      name: voice.name,
      gender: voice.name.toLowerCase().includes("female") ? "female" : "male",
      isOnlineOnly: !voice.localService,
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
  },
  
  // Test speak method specifically for debugging purposes
  testSpeak: () => {
    console.log("Running speech test");
    
    // Try to initialize Android voices if needed
    if (/Android/i.test(navigator.userAgent)) {
      console.log("Android detected, running voice init workaround");
      const dummyUtterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(dummyUtterance);
      window.speechSynthesis.cancel();
    }
    
    const voices = window.speechSynthesis.getVoices();
    console.log(`Available voices (${voices.length}):`, voices.map(v => v.name).join(", "));
    
    // Create a simple test utterance
    const testUtterance = new SpeechSynthesisUtterance("This is a test of the speech synthesis system.");
    
    if (voices.length > 0) {
      testUtterance.voice = voices[0];
      console.log("Using voice for test:", voices[0].name);
    }
    
    // Add event handlers for debugging
    testUtterance.onstart = () => console.log("Test speech started");
    testUtterance.onend = () => console.log("Test speech ended successfully");
    testUtterance.onerror = (e) => console.error("Test speech error:", e);
    
    // Speak
    window.speechSynthesis.speak(testUtterance);
  }
};
