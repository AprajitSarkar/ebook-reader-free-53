
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { poetryService, Poem } from "@/services/poetryService";
import SearchBar from "@/components/SearchBar";
import PoemCard from "@/components/PoemCard";
import PoemSkeleton from "@/components/PoemSkeleton";
import { toast } from "@/lib/toast";

type SearchType = "title" | "author" | "lines";

const Search = () => {
  const [searchType, setSearchType] = useState<SearchType>("title");
  const [results, setResults] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      let searchResults: Poem[] = [];
      
      switch (searchType) {
        case "title":
          searchResults = await poetryService.searchByTitle(query);
          break;
        case "author":
          searchResults = await poetryService.searchByAuthor(query);
          break;
        case "lines":
          searchResults = await poetryService.searchByLines(query);
          break;
      }
      
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast.info("No poems found matching your search");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching for poems");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setLoadingSuggestions(true);
    
    try {
      let suggestionResults: string[] = [];
      
      switch (searchType) {
        case "title":
          const titleResult = await poetryService.getTitles();
          suggestionResults = titleResult.titles
            .filter(title => title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
          break;
        case "author":
          const authorResult = await poetryService.getAuthors();
          suggestionResults = authorResult.authors
            .filter(author => author.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
          break;
        case "lines":
          // For lines search, we don't have a pre-existing list, so let's just show the current query
          suggestionResults = [query];
          break;
      }
      
      setSuggestions(suggestionResults);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Handle query changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentQuery) {
        fetchSuggestions(currentQuery);
      } else {
        setSuggestions([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [currentQuery, searchType]);

  // Reset suggestions when search type changes
  useEffect(() => {
    setSuggestions([]);
    setCurrentQuery("");
  }, [searchType]);

  const handleQueryChange = (query: string) => {
    setCurrentQuery(query);
  };

  const viewPoemDetails = (poem: Poem) => {
    sessionStorage.setItem("selectedPoem", JSON.stringify(poem));
    navigate("/poem-details");
  };

  return (
    <div className="container px-4 py-12 pb-24 min-h-screen">
      <h1 className="text-2xl font-serif font-bold text-center mb-8 gradient-text">
        Find Your Poem
      </h1>
      
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg p-1 bg-secondary/30">
          {(["title", "author", "lines"] as SearchType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === type
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <SearchBar 
        onSearch={handleSearch} 
        placeholder={`Search by ${searchType}...`}
        suggestions={suggestions}
        isLoading={loadingSuggestions}
        onQueryChange={handleQueryChange}
      />
      
      <div className="mt-12">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <PoemSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {hasSearched && results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-foreground/70">No poems found</p>
                <p className="text-sm text-foreground/50 mt-2">
                  Try a different search term or category
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((poem, index) => (
                  <div 
                    key={index} 
                    onClick={() => viewPoemDetails(poem)}
                    className="cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PoemCard poem={poem} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
