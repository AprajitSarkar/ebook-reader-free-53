
import { useState, useEffect } from "react";
import { poetryService, Poem } from "@/services/poetryService";
import PoemCard from "@/components/PoemCard";
import { useNavigate } from "react-router-dom";
import PoemSkeleton from "@/components/PoemSkeleton";
import { Sparkles } from "lucide-react";

const Home = () => {
  const [featuredPoem, setFeaturedPoem] = useState<Poem | null>(null);
  const [recentPoems, setRecentPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoems = async () => {
      try {
        const randomPoems = await poetryService.getRandomPoems(5);
        setFeaturedPoem(randomPoems[0]);
        setRecentPoems(randomPoems.slice(1));
      } catch (error) {
        console.error("Failed to fetch poems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoems();
  }, []);

  const viewPoemDetails = (poem: Poem) => {
    // Store poem in session storage to access on the details page
    sessionStorage.setItem("selectedPoem", JSON.stringify(poem));
    navigate("/poem-details");
  };

  return (
    <div className="container px-4 py-8 pt-16 pb-24 min-h-screen">
      <header className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 gradient-text">
          Poetic Clouds
        </h1>
        <p className="text-foreground/70 max-w-md mx-auto">
          Explore beautiful poetry from classic and contemporary authors
        </p>
      </header>

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles size={18} className="text-primary" />
          <h2 className="text-xl font-serif font-medium">Featured Poem</h2>
        </div>
        {loading ? (
          <PoemSkeleton />
        ) : (
          featuredPoem && (
            <div onClick={() => viewPoemDetails(featuredPoem)} className="cursor-pointer">
              <PoemCard poem={featuredPoem} />
            </div>
          )
        )}
      </section>

      <section>
        <h2 className="text-xl font-serif font-medium mb-6">Discover More</h2>
        <div className="grid gap-6">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, index) => <PoemSkeleton key={index} />)
          ) : (
            recentPoems.map((poem, index) => (
              <div 
                key={index} 
                onClick={() => viewPoemDetails(poem)} 
                className="cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PoemCard poem={poem} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
