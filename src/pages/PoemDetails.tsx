import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Poem } from "@/services/poetryService";
import PoemCard from "@/components/PoemCard";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "@/lib/toast";

const PoemDetails = () => {
  const [poem, setPoem] = useState<Poem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPoem = sessionStorage.getItem("selectedPoem");
    if (storedPoem) {
      setPoem(JSON.parse(storedPoem));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const goBack = () => {
    navigate(-1);
  };

  const sharePoem = () => {
    if (poem) {
      if (navigator.share) {
        navigator
          .share({
            title: `${poem.title} by ${poem.author}`,
            text: poem.lines.join("\n"),
          })
          .catch((error) => console.log("Error sharing", error));
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(
          `${poem.title} by ${poem.author}\n\n${poem.lines.join("\n")}`
        );
        toast.success("Poem copied to clipboard!");
      }
    }
  };

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

      <PoemCard poem={poem} fullView={true} />
      
      <div className="mt-8 text-center">
        <p className="text-sm text-foreground/60">
          {poem.linecount} lines • Published by {poem.author}
        </p>
      </div>
    </div>
  );
};

export default PoemDetails;
