
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { poetryService, Poem } from "@/services/poetryService";
import SearchBar from "@/components/SearchBar";
import PoemCard from "@/components/PoemCard";
import PoemSkeleton from "@/components/PoemSkeleton";
import { toast } from "@/lib/toast";
import { History, Plus, Trash2 } from "lucide-react";

type SearchType = "title" | "author" | "lines";

const Search = () => {
  const [searchType, setSearchType] = useState<SearchType>("title");
  const [results, setResults] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  // Load search history on component mount
  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    // Add to search history
    const updatedHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    setShowHistory(false);
    
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

  const clearSearchHistory = () => {
    localStorage.removeItem("searchHistory");
    setSearchHistory([]);
    setShowHistory(false);
    toast.success("Search history cleared");
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
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
      
      <div className="relative">
        <div className="flex items-center mb-2">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder={`Search by ${searchType}...`}
            suggestions={suggestions}
            isLoading={loadingSuggestions}
            onQueryChange={handleQueryChange}
          />
          
          <button 
            onClick={toggleHistory}
            className="ml-2 p-2 rounded-full bg-secondary/30 hover:bg-secondary/50 transition-colors"
            aria-label="View search history"
          >
            <History size={20} className="text-foreground/70" />
          </button>
        </div>
        
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute w-full z-50 mt-1 bg-background rounded-lg border shadow-md p-2 animate-in fade-in-50 slide-in-from-top-5">
            <div className="flex justify-between items-center mb-2 px-2">
              <h3 className="text-sm font-medium">Recent Searches</h3>
              <button 
                onClick={clearSearchHistory}
                className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
            <ul className="space-y-1">
              {searchHistory.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSearch(item)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-secondary/50 text-sm flex items-center"
                  >
                    <History size={14} className="mr-2 text-foreground/60" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
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
