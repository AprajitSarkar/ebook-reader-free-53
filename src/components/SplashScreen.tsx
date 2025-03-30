
import { useState, useEffect } from "react";
import { BookOpen, Stars, Sparkles } from "lucide-react";

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
        <div className="absolute top-[-20px] right-[-25px] text-primary/70 animate-bounce-gentle">
          <Sparkles size={28} className="animate-pulse" />
        </div>
        <div className="animate-expand">
          <BookOpen 
            size={72} 
            className="text-primary animate-pulse-soft" 
          />
        </div>
        <div className="absolute bottom-[-15px] left-[-25px] text-accent/70 animate-float" style={{ animationDelay: "0.5s" }}>
          <Stars size={24} className="animate-sparkle" />
        </div>
      </div>
      
      <h1 className="text-4xl font-serif font-bold gradient-text mb-3 animate-slide-up-fade">Book Reader</h1>
      <p className="text-foreground/60 animate-slide-down-fade opacity-0" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>Your digital library companion</p>
      
      <div className="mt-12 animate-fade-in-slow opacity-0" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
        <div className="w-48 h-2 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-primary/50 via-primary to-accent/80 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
