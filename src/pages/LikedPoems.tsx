
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Poem } from "@/services/poetryService";
import PoemCard from "@/components/PoemCard";
import { ArrowLeft, Heart, Volume2 } from "lucide-react";
import { speechService } from "@/services/speechService";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

const LikedPoems = () => {
  const [likedPoems, setLikedPoems] = useState<Poem[]>([]);
  const [visible, setVisible] = useState(false);
  const [speakingPoemId, setSpeakingPoemId] = useState<string | null>(null);
  const { settings } = useUserSettings();
  const navigate = useNavigate();

  useEffect(() => {
    loadLikedPoems();
    setVisible(true);
  }, []);

  const loadLikedPoems = () => {
    const storedLikedPoems = JSON.parse(localStorage.getItem("likedPoems") || "[]");
    setLikedPoems(storedLikedPoems);
  };

  const goBack = () => {
    // Stop any ongoing reading when navigating away
    speechService.stop();
    navigate(-1);
  };

  const viewPoemDetails = (poem: Poem) => {
    sessionStorage.setItem("selectedPoem", JSON.stringify(poem));
    navigate("/poem-details");
  };

  const getUniqueId = (poem: Poem, index: number) => {
    return `${poem.title}-${poem.author}-${index}`;
  };

  const readPoem = (poem: Poem, index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to poem details
    
    // Format the poem text for a better reading experience
    const title = `${poem.title} by ${poem.author}.`;
    
    // Add pauses between stanzas for better rhythm
    const poemLines = poem.lines.join(". ");
    const poemText = `${title} ${poemLines}`;
    
    // Get the user's preferred voice if available
    let voice = null;
    if (settings.preferredVoice) {
      voice = window.speechSynthesis.getVoices().find(
        v => v.voiceURI === settings.preferredVoice?.id
      ) || null;
    }
    
    // Stop any ongoing speech
    speechService.stop();
    
    // Set the speaking poem ID
    const poemId = getUniqueId(poem, index);
    setSpeakingPoemId(poemId);
    
    // Speak the poem
    speechService.speak(poemText, voice);
    
    toast.success("Reading poem aloud", {
      description: "Using " + (settings.preferredVoice?.name || "default voice")
    });
    
    // Set up a periodic check for when speech ends
    const checkInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeakingPoemId(null);
        clearInterval(checkInterval);
      }
    }, 100);
  };

  const stopReading = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to poem details
    speechService.stop();
    setSpeakingPoemId(null);
    toast.success("Stopped reading");
  };

  return (
    <div className="min-h-screen container">
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-10 p-4">
        <div className="flex justify-between items-center max-w-screen-lg mx-auto">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-serif font-bold gradient-text">
            Your Favorite Poems
          </h1>
          
          <div className="w-8"></div> {/* Empty div for centering */}
        </div>
      </div>

      <div className="pt-20 pb-24 px-4">
        <div className="text-center mb-10 flex items-center justify-center gap-2">
          <Heart size={16} fill="currentColor" className="text-rose-400" />
          <span className="text-foreground/70">Poems you've liked will appear here</span>
        </div>

        {likedPoems.length === 0 ? (
          <div className={`text-center py-12 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
            <p className="text-foreground/70 mb-2">You haven't liked any poems yet</p>
            <p className="text-sm text-foreground/50">
              Click the heart icon on poems you love to save them here
            </p>
            <button
              onClick={() => navigate("/search")}
              className="mt-6 px-4 py-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              Discover Poems
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {likedPoems.map((poem, index) => {
              const poemId = getUniqueId(poem, index);
              const isSpeaking = speakingPoemId === poemId;
              
              return (
                <div 
                  key={poemId} 
                  className="cursor-pointer animate-fade-in relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div onClick={() => viewPoemDetails(poem)}>
                    <PoemCard poem={poem} />
                  </div>
                  
                  {/* Text-to-speech button */}
                  <div className="absolute top-4 right-16">
                    {isSpeaking ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={(e) => stopReading(e)} 
                        className="flex items-center gap-1"
                      >
                        <span>Stop</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => readPoem(poem, index, e)} 
                        className="flex items-center gap-1"
                      >
                        <Volume2 size={16} />
                        <span>Read</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedPoems;
