
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Poem } from "@/services/poetryService";
import PoemCard from "@/components/PoemCard";
import { ArrowLeft, Share2, Globe, Mic, MicOff } from "lucide-react";
import { toast } from "@/lib/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { translationService } from "@/services/translationService";
import { speechService } from "@/services/speechService";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { Input } from "@/components/ui/input";

const PoemDetails = () => {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [translatedPoem, setTranslatedPoem] = useState<Poem | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translationLanguage, setTranslationLanguage] = useState<string>("");
  const [languageSearch, setLanguageSearch] = useState("");
  const [isReading, setIsReading] = useState(false);
  const { settings } = useUserSettings();
  const navigate = useNavigate();

  const allLanguages = translationService.getAvailableLanguages();
  const filteredLanguages = allLanguages.filter(lang => 
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  useEffect(() => {
    const storedPoem = sessionStorage.getItem("selectedPoem");
    if (storedPoem) {
      setPoem(JSON.parse(storedPoem));
    } else {
      navigate("/poems");
    }
    
    // Set default translation language from user settings
    setTranslationLanguage(settings.preferredLanguage);
  }, [navigate, settings.preferredLanguage]);

  const goBack = () => {
    // Stop any ongoing reading when navigating away
    if (isReading) {
      speechService.stop();
    }
    navigate(-1);
  };

  const sharePoem = () => {
    if (poem) {
      // Create a formatted poem text with title, author, and poem text
      const poemText = `${poem.title}\nby ${poem.author}\n\n${poem.lines.join("\n")}\n\nShared from Poetic Clouds app\nGet it on Play Store: https://play.google.com/store/apps/details?id=com.hitmouse`;
      
      if (navigator.share) {
        navigator
          .share({
            title: `${poem.title} by ${poem.author}`,
            text: poemText,
          })
          .catch((error) => console.log("Error sharing", error));
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(poemText);
        toast.success("Poem copied to clipboard!");
      }
    }
  };

  const translatePoem = async () => {
    if (!poem || !translationLanguage) return;
    
    try {
      toast.info(`Translating to ${translationLanguage}...`);
      
      // Translate the title
      const translatedTitle = await translationService.translateText(
        poem.title,
        translationLanguage
      );
      
      // Translate each line of the poem
      const translatedLines = await Promise.all(
        poem.lines.map(line => 
          translationService.translateText(line, translationLanguage)
        )
      );
      
      // Create a new translated poem object
      const translatedPoemObj: Poem = {
        ...poem,
        title: translatedTitle,
        lines: translatedLines,
      };
      
      setTranslatedPoem(translatedPoemObj);
      setIsTranslated(true);
      
      const languageName = allLanguages.find(l => l.code === translationLanguage)?.name || translationLanguage;
      toast.success(`Poem translated to ${languageName}`);
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Failed to translate the poem. Please try again.");
    }
  };

  const resetTranslation = () => {
    setIsTranslated(false);
    setTranslatedPoem(null);
  };

  const readPoem = () => {
    if (!poem) return;
    
    const poemText = `${poem.title} by ${poem.author}. ${poem.lines.join(". ")}`;
    
    // Get the user's preferred voice if available
    let voice = null;
    if (settings.preferredVoice) {
      voice = window.speechSynthesis.getVoices().find(
        v => v.voiceURI === settings.preferredVoice?.id
      ) || null;
    }
    
    setIsReading(true);
    speechService.speak(poemText, voice);
    
    // Set up event listener to detect when speech has finished
    const checkSpeaking = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsReading(false);
        clearInterval(checkSpeaking);
      }
    }, 100);
  };

  const stopReading = () => {
    speechService.stop();
    setIsReading(false);
  };

  const activePoem = isTranslated && translatedPoem ? translatedPoem : poem;

  if (!poem) {
    return (
      <div className="container px-4 py-12 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-foreground/70">Loading poem...</div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 pb-24 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        
        <button
          onClick={sharePoem}
          className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Globe size={18} />
            <span className="text-sm">Translate to:</span>
          </div>
          
          <div className="flex gap-2 items-center flex-1">
            <Input
              className="max-w-xs"
              placeholder="Search languages..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 mb-4">
          {filteredLanguages.map((lang) => (
            <Button
              key={lang.code}
              size="sm"
              variant={translationLanguage === lang.code ? "default" : "outline"}
              onClick={() => setTranslationLanguage(lang.code)}
            >
              {lang.name}
            </Button>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          {isTranslated ? (
            <Button variant="outline" onClick={resetTranslation}>
              Show Original
            </Button>
          ) : (
            <Button onClick={translatePoem} disabled={!translationLanguage}>
              Translate
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            {isReading ? (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={stopReading} 
                className="flex items-center gap-1"
              >
                <MicOff size={16} />
                <span>Stop</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={readPoem} 
                className="flex items-center gap-1"
              >
                <Mic size={16} />
                <span>Read Aloud</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {activePoem && <PoemCard poem={activePoem} fullView={true} />}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-foreground/60">
          {activePoem.linecount} lines • Published by {activePoem.author}
        </p>
      </div>
    </div>
  );
};

export default PoemDetails;
