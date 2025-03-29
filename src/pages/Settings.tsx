import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { speechService, VoiceOption } from "@/services/speechService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Search, ArrowLeft } from "lucide-react";
import { toast } from "@/lib/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { settings, updateVoice } = useUserSettings();
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [preferredVoices, setPreferredVoices] = useState<VoiceOption[]>([]);
  const [googleVoices, setGoogleVoices] = useState<VoiceOption[]>([]);
  const [offlineVoices, setOfflineVoices] = useState<VoiceOption[]>([]);
  const [voiceSearch, setVoiceSearch] = useState("");
  const [activeTab, setActiveTab] = useState("google");
  
  // Filter voices
  const filteredVoices = availableVoices.filter(voice => 
    voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    (voice.lang && voice.lang.toLowerCase().includes(voiceSearch.toLowerCase()))
  );

  const filteredPreferredVoices = preferredVoices.filter(voice => 
    voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    (voice.lang && voice.lang.toLowerCase().includes(voiceSearch.toLowerCase()))
  );
  
  const filteredGoogleVoices = googleVoices.filter(voice => 
    voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    (voice.lang && voice.lang.toLowerCase().includes(voiceSearch.toLowerCase()))
  );
  
  const filteredOfflineVoices = offlineVoices.filter(voice => 
    voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    (voice.lang && voice.lang.toLowerCase().includes(voiceSearch.toLowerCase()))
  );

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechService.getVoices();
      const preferred = speechService.getPreferredVoices();
      const google = speechService.getGoogleVoices();
      const offline = speechService.getOfflineVoices();
      
      setAvailableVoices(allVoices);
      setPreferredVoices(preferred);
      setGoogleVoices(google);
      setOfflineVoices(offline);
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
  
  const goBack = () => {
    navigate(-1);
  };

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

  return (
    <div className="container px-4 pb-24 min-h-screen">
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-10 p-4">
        <div className="flex justify-between items-center max-w-screen-lg mx-auto">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors text-xs sm:text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          
          <h1 className="text-xl sm:text-2xl font-serif font-bold gradient-text">Settings</h1>
          
          <div className="w-[72px]"></div> {/* Empty div for balance */}
        </div>
      </div>

      <div className="space-y-8 pt-20">
        {/* Text-to-Speech Settings */}
        <div className="glass-card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-medium mb-4 flex items-center gap-2">
            <Mic size={isMobile ? 18 : 20} />
            Text-to-Speech Settings
          </h2>
          
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-foreground/70">
              Select your preferred voice for reading poems:
            </p>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search voices by name or language..."
                value={voiceSearch}
                onChange={(e) => setVoiceSearch(e.target.value)}
                className="pl-10 text-xs sm:text-sm"
              />
            </div>
            
            <Tabs defaultValue="google" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="google" className="text-xs sm:text-sm">Google Voices</TabsTrigger>
                <TabsTrigger value="offline" className="text-xs sm:text-sm">Offline Voices</TabsTrigger>
                <TabsTrigger value="recommended" className="text-xs sm:text-sm">Recommended</TabsTrigger>
                <TabsTrigger value="all" className="text-xs sm:text-sm">All Voices</TabsTrigger>
              </TabsList>
              
              <TabsContent value="google" className="mt-4">
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {filteredGoogleVoices.length > 0 ? (
                    filteredGoogleVoices.map(voice => (
                      <div 
                        key={voice.id} 
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-md border ${
                          settings.preferredVoice?.id === voice.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{voice.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${voice.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                            <p className="text-xs text-foreground/60">{voice.gender} {voice.lang && `• ${voice.lang}`}</p>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => testVoice(voice)}
                            className="text-xs h-7 sm:h-9"
                          >
                            Test
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleVoiceSelect(voice)}
                            disabled={settings.preferredVoice?.id === voice.id}
                            className="text-xs h-7 sm:h-9"
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-foreground/60 py-4 text-xs sm:text-sm">
                      {googleVoices.length === 0 
                        ? "Loading Google voices..." 
                        : "No Google voices matching your search"
                      }
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="offline" className="mt-4">
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {filteredOfflineVoices.length > 0 ? (
                    filteredOfflineVoices.map(voice => (
                      <div 
                        key={voice.id} 
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-md border ${
                          settings.preferredVoice?.id === voice.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{voice.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${voice.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                            <p className="text-xs text-foreground/60">{voice.gender} {voice.lang && `• ${voice.lang}`}</p>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => testVoice(voice)}
                            className="text-xs h-7 sm:h-9"
                          >
                            Test
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleVoiceSelect(voice)}
                            disabled={settings.preferredVoice?.id === voice.id}
                            className="text-xs h-7 sm:h-9"
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-foreground/60 py-4 text-xs sm:text-sm">
                      {offlineVoices.length === 0 
                        ? "Loading offline voices..." 
                        : "No offline voices matching your search"
                      }
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="recommended" className="mt-4">
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {filteredPreferredVoices.length > 0 ? (
                    filteredPreferredVoices.map(voice => (
                      <div 
                        key={voice.id} 
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-md border ${
                          settings.preferredVoice?.id === voice.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{voice.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${voice.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                            <p className="text-xs text-foreground/60">{voice.gender} {voice.lang && `• ${voice.lang}`}</p>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => testVoice(voice)}
                            className="text-xs h-7 sm:h-9"
                          >
                            Test
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleVoiceSelect(voice)}
                            disabled={settings.preferredVoice?.id === voice.id}
                            className="text-xs h-7 sm:h-9"
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-foreground/60 py-4 text-xs sm:text-sm">
                      {preferredVoices.length === 0 
                        ? "Loading recommended voices..." 
                        : "No recommended voices matching your search"
                      }
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="all" className="mt-4">
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {filteredVoices.length > 0 ? (
                    filteredVoices.map(voice => (
                      <div 
                        key={voice.id} 
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-md border ${
                          settings.preferredVoice?.id === voice.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{voice.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${voice.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                            <p className="text-xs text-foreground/60">{voice.gender} {voice.lang && `• ${voice.lang}`}</p>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => testVoice(voice)}
                            className="text-xs h-7 sm:h-9"
                          >
                            Test
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleVoiceSelect(voice)}
                            disabled={settings.preferredVoice?.id === voice.id}
                            className="text-xs h-7 sm:h-9"
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-foreground/60 py-4 text-xs sm:text-sm">
                      {availableVoices.length === 0 
                        ? "Loading voices..." 
                        : "No voices matching your search"
                      }
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            {settings.preferredVoice && (
              <div className="mt-6 p-3 sm:p-4 bg-primary/5 rounded-md border border-primary/20">
                <h3 className="font-medium mb-2 text-xs sm:text-sm">Currently Selected Voice</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm">{settings.preferredVoice.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${settings.preferredVoice.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                      <p className="text-xs text-foreground/60">
                        {settings.preferredVoice.gender} 
                        {settings.preferredVoice.lang && ` • ${settings.preferredVoice.lang}`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => testVoice(settings.preferredVoice!)}
                    className="text-xs h-7 sm:h-9"
                  >
                    Test
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
