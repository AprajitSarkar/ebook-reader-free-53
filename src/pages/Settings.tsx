
import { useState, useEffect } from "react";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { speechService, VoiceOption } from "@/services/speechService";
import { translationService } from "@/services/translationService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mic, Settings as SettingsIcon } from "lucide-react";
import { toast } from "@/lib/toast";

const Settings = () => {
  const { settings, updateLanguage, updateVoice } = useUserSettings();
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [voiceSearch, setVoiceSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState(translationService.getAvailableLanguages());
  
  // Filter voices
  const filteredVoices = availableVoices.filter(voice => 
    voice.name.toLowerCase().includes(voiceSearch.toLowerCase())
  );

  // Filter languages
  const filteredLanguages = availableLanguages.filter(lang => 
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechService.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();

    // Some browsers load voices asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const testVoice = (voice: VoiceOption) => {
    const sampleText = "This is a sample of how this voice sounds.";
    const systemVoice = window.speechSynthesis.getVoices().find(v => v.voiceURI === voice.id);
    if (systemVoice) {
      speechService.speak(sampleText, systemVoice);
    }
  };

  const handleVoiceSelect = (voice: VoiceOption) => {
    updateVoice(voice);
    toast.success(`Voice set to ${voice.name}`);
  };

  const handleLanguageSelect = (langCode: string) => {
    updateLanguage(langCode);
    const langName = availableLanguages.find(l => l.code === langCode)?.name || langCode;
    toast.success(`Translation language set to ${langName}`);
  };

  return (
    <div className="container px-4 py-12 pb-24 min-h-screen">
      <h1 className="text-2xl font-serif font-bold gradient-text mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Translation Settings */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Search size={20} />
            Translation Settings
          </h2>
          
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              Select your preferred language for poem translations:
            </p>
            
            <Input
              placeholder="Search languages..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="mb-2"
            />
            
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {filteredLanguages.map(language => (
                <Button
                  key={language.code}
                  variant={settings.preferredLanguage === language.code ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleLanguageSelect(language.code)}
                >
                  {language.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Text-to-Speech Settings */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Mic size={20} />
            Text-to-Speech Settings
          </h2>
          
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              Select your preferred voice for reading poems:
            </p>
            
            <Input
              placeholder="Search voices..."
              value={voiceSearch}
              onChange={(e) => setVoiceSearch(e.target.value)}
              className="mb-2"
            />
            
            <div className="space-y-2">
              {filteredVoices.length > 0 ? (
                filteredVoices.map(voice => (
                  <div 
                    key={voice.id} 
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      settings.preferredVoice?.id === voice.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{voice.name}</p>
                      <p className="text-sm text-foreground/60">{voice.gender}</p>
                    </div>
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => testVoice(voice)}
                      >
                        Test
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleVoiceSelect(voice)}
                        disabled={settings.preferredVoice?.id === voice.id}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-foreground/60 py-4">
                  {availableVoices.length === 0 
                    ? "Loading voices or no voices available on your device..." 
                    : "No voices matching your search"
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
