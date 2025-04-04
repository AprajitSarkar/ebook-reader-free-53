
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { speechService, VoiceOption } from "@/services/speechService";
import { toast } from "@/lib/toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Volume2, Github, Info, ExternalLink, Moon, Sun } from "lucide-react";
import { Capacitor } from "@capacitor/core";

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateVoice, toggleOfflineMode, testVoice } = useUserSettings();
  const [voiceOptions, setVoiceOptions] = useState<VoiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Load voice options
  useEffect(() => {
    // Set mounted to true to prevent hydration issues
    setMounted(true);
    
    let isMounted = true;
    
    const loadVoices = () => {
      try {
        console.log("Loading voice options in Settings");
        const voices = speechService.getVoices();
        if (isMounted) {
          console.log(`Found ${voices.length} voices in Settings`);
          setVoiceOptions(voices);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading voices:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial load
    loadVoices();
    
    // Setup listener for voices changed event
    if (window.speechSynthesis) {
      const onVoicesChanged = () => {
        console.log("Voices changed event detected in Settings");
        loadVoices();
      };
      
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    }
    
    return () => {
      isMounted = false;
      // Clean up listener
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleVoiceChange = (value: string) => {
    if (value === "default") {
      updateVoice(null);
    } else {
      const selectedVoice = voiceOptions.find(voice => voice.id === value) || null;
      updateVoice(selectedVoice);
    }
  };

  const handleOfflineToggle = (checked: boolean) => {
    toggleOfflineMode(checked);
    
    if (checked) {
      toast.info("Using offline voices only");
    } else {
      toast.info("Using all available voices");
    }
  };

  // Only render the component after mounting to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-5 pb-28">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="mr-2 h-5 w-5" />
                Text-to-Speech Settings
              </CardTitle>
              <CardDescription>
                Configure the voice used for reading text aloud
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Voice Selection</label>
                <Select
                  disabled={isLoading}
                  onValueChange={handleVoiceChange}
                  value={settings.preferredVoice?.id || "default"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoading ? "Loading voices..." : "Select voice"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">System Default</SelectItem>
                    {voiceOptions.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} ({voice.gender})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Use Offline Voices Only</label>
                  <p className="text-xs text-muted-foreground">
                    Only show voices available offline
                  </p>
                </div>
                <Switch
                  checked={settings.useOfflineVoice}
                  onCheckedChange={handleOfflineToggle}
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testVoice}
                  className="w-full"
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Test Voice
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                About
              </CardTitle>
              <CardDescription>
                Book Reader App Information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm">Version: 1.0.0</p>
                <p className="text-sm">Developed with ❤️ by Lovable AI</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://github.com/lovable-ai/book-reader" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    Source Code
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Privacy Policy
                  </a>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              All books are provided by Project Gutenberg. Book Reader respects copyright laws.
            </CardFooter>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Settings;
