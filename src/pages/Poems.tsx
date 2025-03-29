
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { poetryService, Poem } from "@/services/poetryService";
import PoemCard from "@/components/PoemCard";
import PoemSkeleton from "@/components/PoemSkeleton";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Poems = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPoems = async () => {
    setLoading(true);
    try {
      const randomPoems = await poetryService.getRandomPoems(8);
      setPoems(randomPoems);
    } catch (error) {
      console.error("Failed to fetch poems:", error);
      toast.error("Error loading poems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, []);

  const viewPoemDetails = (poem: Poem) => {
    sessionStorage.setItem("selectedPoem", JSON.stringify(poem));
    navigate("/poem-details");
  };

  const refreshPoems = () => {
    fetchPoems();
  };

  return (
    <div className="container px-4 py-12 pb-24 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif font-bold gradient-text">
          Discover Poems
        </h1>
        <Button 
          onClick={refreshPoems}
          variant="outline"
          className="flex items-center gap-2 text-foreground/80 hover:text-primary/80 border-primary/30 hover:border-primary/50"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          Array(8)
            .fill(0)
            .map((_, index) => <PoemSkeleton key={index} />)
        ) : (
          poems.map((poem, index) => (
            <div 
              key={index} 
              onClick={() => viewPoemDetails(poem)} 
              className="cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PoemCard poem={poem} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Poems;
