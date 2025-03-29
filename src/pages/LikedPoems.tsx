
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Poem } from "@/services/poetryService";
import PoemCard from "@/components/PoemCard";
import { ArrowLeft, Heart } from "lucide-react";

const LikedPoems = () => {
  const [likedPoems, setLikedPoems] = useState<Poem[]>([]);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedLikedPoems = JSON.parse(localStorage.getItem("likedPoems") || "[]");
    setLikedPoems(storedLikedPoems);
    setVisible(true);
  }, []);

  const goBack = () => {
    navigate(-1);
  };

  const viewPoemDetails = (poem: Poem) => {
    sessionStorage.setItem("selectedPoem", JSON.stringify(poem));
    navigate("/poem-details");
  };

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
      </div>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-serif font-bold gradient-text mb-2">
          Your Favorite Poems
        </h1>
        <p className="text-foreground/70 flex items-center justify-center gap-2">
          <Heart size={16} fill="currentColor" className="text-rose-400" />
          <span>Poems you've liked will appear here</span>
        </p>
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
          {likedPoems.map((poem, index) => (
            <div 
              key={`${poem.title}-${poem.author}-${index}`} 
              onClick={() => viewPoemDetails(poem)}
              className="cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PoemCard poem={poem} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedPoems;
