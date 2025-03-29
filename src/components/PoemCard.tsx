
import { Poem } from "@/services/poetryService";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface PoemCardProps {
  poem: Poem;
  fullView?: boolean;
}

const PoemCard = ({ poem, fullView = false }: PoemCardProps) => {
  const [liked, setLiked] = useState(false);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
  }, []);

  const toggleLike = () => {
    setLiked(!liked);
  };

  return (
    <div 
      className={`glass-card p-6 flex flex-col gap-4 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${fullView ? "max-w-3xl mx-auto" : "hover:shadow-lg hover:shadow-primary/20"}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-serif font-bold text-xl mb-1 text-primary">{poem.title}</h2>
          <p className="text-sm text-foreground/70">by {poem.author}</p>
        </div>
        <button
          onClick={toggleLike}
          className={`p-2 rounded-full ${liked ? "text-rose-400" : "text-foreground/40"} transition-colors`}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} className="transition-transform hover:scale-110" />
        </button>
      </div>
      
      <div className="poem-text text-foreground/90 space-y-1">
        {fullView ? (
          poem.lines.map((line, index) => (
            <p 
              key={index} 
              className="poem-line" 
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {line || "\u00A0"}
            </p>
          ))
        ) : (
          <>
            {poem.lines.slice(0, 4).map((line, index) => (
              <p key={index} className="poem-line overflow-hidden text-ellipsis" style={{ animationDelay: `${index * 0.05}s` }}>
                {line || "\u00A0"}
              </p>
            ))}
            {poem.lines.length > 4 && <p className="text-primary font-medium">Read more...</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default PoemCard;
