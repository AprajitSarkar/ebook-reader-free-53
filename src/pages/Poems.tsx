
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { poetryService, Poem } from "@/services/poetryService";
import PoemCard from "@/components/PoemCard";
import PoemSkeleton from "@/components/PoemSkeleton";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const POEMS_PER_PAGE = 8;

const Poems = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPoemElementRef = useRef<HTMLDivElement | null>(null);
  
  const navigate = useNavigate();

  const fetchPoems = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPoems([]);
      setPage(1);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const randomPoems = await poetryService.getRandomPoems(POEMS_PER_PAGE);
      
      if (reset) {
        setPoems(randomPoems);
      } else {
        setPoems(prevPoems => [...prevPoems, ...randomPoems]);
      }
      
      // For demo purposes, let's pretend we have a limited number of pages
      // In a real API, you'd check if the response is empty or has a "next page" token
      if (page >= 10) {
        setHasMore(false);
      } else {
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error("Failed to fetch poems:", error);
      toast.error("Error loading poems");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPoems(true);
  }, []);

  // Setup IntersectionObserver for infinite scrolling
  const lastPoemRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPoems();
      }
    });
    
    if (node) {
      observer.current.observe(node);
      lastPoemElementRef.current = node;
    }
  }, [loading, loadingMore, hasMore]);

  const viewPoemDetails = (poem: Poem) => {
    sessionStorage.setItem("selectedPoem", JSON.stringify(poem));
    navigate("/poem-details");
  };

  const refreshPoems = () => {
    fetchPoems(true);
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
        {loading && poems.length === 0 ? (
          // Initial loading state
          Array(POEMS_PER_PAGE)
            .fill(0)
            .map((_, index) => <PoemSkeleton key={index} />)
        ) : (
          // Render poems
          poems.map((poem, index) => {
            const isLastItem = index === poems.length - 1;
            
            return (
              <div 
                key={index} 
                ref={isLastItem ? lastPoemRef : null}
                onClick={() => viewPoemDetails(poem)} 
                className="cursor-pointer animate-fade-in"
                style={{ animationDelay: `${Math.min(index, 10) * 0.1}s` }}
              >
                <PoemCard poem={poem} />
              </div>
            );
          })
        )}
        
        {/* Loading more indicator */}
        {loadingMore && hasMore && (
          <div className="col-span-full py-4 flex justify-center">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="animate-spin" />
              <span>Loading more poems...</span>
            </div>
          </div>
        )}
        
        {/* No more poems message */}
        {!hasMore && poems.length > 0 && (
          <div className="col-span-full py-4 text-center text-foreground/60">
            You've reached the end of the collection. 
            <Button 
              variant="link" 
              onClick={refreshPoems}
              className="text-primary"
            >
              Refresh to see more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Poems;
