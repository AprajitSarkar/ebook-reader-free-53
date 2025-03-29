
import { useState, useEffect } from "react";
import { Feather, Stars } from "lucide-react";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background
                transition-opacity duration-1000 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="relative">
        <div className="absolute top-[-10px] right-[-15px] text-primary/70 animate-float">
          <Stars size={24} />
        </div>
        <Feather 
          size={64} 
          className="text-primary animate-pulse-soft mb-4" 
        />
        <div className="absolute bottom-[-5px] left-[-15px] text-accent/70 animate-float" style={{ animationDelay: "0.5s" }}>
          <Stars size={16} />
        </div>
      </div>
      
      <h1 className="text-3xl font-serif font-bold gradient-text mb-3 animate-scale-in">Poetic Clouds</h1>
      <p className="text-foreground/60 animate-fade-in-slow">Journey through words...</p>
    </div>
  );
};

export default SplashScreen;
