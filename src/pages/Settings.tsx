
import React, { useEffect, useState } from "react";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { Clock, Moon, BookText, Volume2, Brush, Laptop, CloudCog, Clock3 } from "lucide-react";

const Settings = () => {
  const { settings, updateSettings } = useUserSettings();

  const handleVoiceChange = (voice: string) => {
    updateSettings({ preferredVoice: voice });
    toast.success("Voice preference updated");
  };

  // Get available voices for speech synthesis
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      }
    };
    
    loadVoices();
    
    // Chrome loads voices asynchronously
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);
  
  const handleClearCache = () => {
    // This would clear all cached books and poems
    localStorage.removeItem("cached_books");
    localStorage.removeItem("cached_books_timestamp");
    // Add other cache clearing logic here
    toast.success("Cache cleared successfully");
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 pb-28">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brush className="h-5 w-5 text-primary" />
              Display
            </CardTitle>
            <CardDescription>Customize your reading experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Always use dark theme</p>
              </div>
              <Switch id="dark-mode" checked disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">A</span>
                <Slider
                  id="font-size"
                  min={80}
                  max={120}
                  step={10}
                  defaultValue={[100]}
                  className="flex-1"
                />
                <span className="text-lg">A</span>
              </div>
              <div className="flex justify-end">
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Reading Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookText className="h-5 w-5 text-primary" />
              Reading
            </CardTitle>
            <CardDescription>Adjust your reading preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-scroll">Auto-scroll</Label>
                <p className="text-sm text-muted-foreground">Automatically scroll when reading</p>
              </div>
              <div className="flex items-center">
                <Switch id="auto-scroll" disabled />
                <Badge variant="outline" className="ml-2">Coming Soon</Badge>
              </div>
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="reading-speed">Reading Speed</Label>
              <div className="flex items-center gap-4">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
                <Slider
                  id="reading-speed"
                  min={1}
                  max={5}
                  step={1}
                  defaultValue={[3]}
                  disabled
                  className="flex-1"
                />
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex justify-end">
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Voice
            </CardTitle>
            <CardDescription>Text-to-speech settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="voice-select">Voice</Label>
              <Select
                value={settings.preferredVoice} 
                onValueChange={handleVoiceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.length > 0 ? (
                    voices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name} {voice.lang && `(${voice.lang})`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="default">Default Voice</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice-speed">Voice Speed</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">Slow</span>
                <Slider
                  id="voice-speed"
                  min={0.5}
                  max={2}
                  step={0.1}
                  defaultValue={[1]}
                  disabled
                  className="flex-1"
                />
                <span className="text-sm">Fast</span>
              </div>
              <div className="flex justify-end">
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Data & Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudCog className="h-5 w-5 text-primary" />
              Data & Storage
            </CardTitle>
            <CardDescription>Manage your app data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Offline Access</Label>
                <p className="text-sm text-muted-foreground">Cache books for offline reading</p>
              </div>
              <Switch checked disabled />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Clear Cache</Label>
                <p className="text-sm text-muted-foreground">Remove all cached content</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleClearCache}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-primary" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>App Version</span>
              <span className="text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span className="text-muted-foreground">{new Date().toISOString().split('T')[0]}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Check for Updates
              <Badge variant="outline" className="ml-2">Coming Soon</Badge>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
