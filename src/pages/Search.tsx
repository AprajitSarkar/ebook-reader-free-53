
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { poetryService, Poem } from "@/services/poetryService";
import { Book, gutendexService } from "@/services/gutendexService";
import SearchBar from "@/components/SearchBar";
import PoemCard from "@/components/PoemCard";
import PoemSkeleton from "@/components/PoemSkeleton";
import BookCard from "@/components/BookCard";
import { toast } from "@/lib/toast";
import { History, Trash2, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SearchType = "title" | "author" | "lines";
type ContentType = "poems" | "books";

const Search = () => {
  const [contentType, setContentType] = useState<ContentType>("books");
  const [searchType, setSearchType] = useState<SearchType>("title");
  const [poemResults, setPoemResults] = useState<Poem[]>([]);
  const [bookResults, setBookResults] = useState<Book[]>([]);
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
      if (contentType === "poems") {
        await searchPoems(query);
      } else {
        await searchBooks(query);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching for content");
    } finally {
      setLoading(false);
    }
  };

  const searchPoems = async (query: string) => {
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
    
    setPoemResults(searchResults);
    
    if (searchResults.length === 0) {
      toast.info("No poems found matching your search");
    }
  };

  const searchBooks = async (query: string) => {
    try {
      const response = await gutendexService.searchBooks(query);
      setBookResults(response.results);
      
      if (response.results.length === 0) {
        toast.info("No books found matching your search");
      }
    } catch (error) {
      console.error("Error searching books:", error);
      setBookResults([]);
      toast.error("Error searching for books");
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
      
      if (contentType === "poems") {
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
            // For lines search, we don't have a pre-existing list
            suggestionResults = [query];
            break;
        }
      } else {
        // For books, we don't have a pre-existing list of suggestions
        suggestionResults = [query];
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
  }, [currentQuery, searchType, contentType]);

  // Reset suggestions when search type changes
  useEffect(() => {
    setSuggestions([]);
    setCurrentQuery("");
  }, [searchType, contentType]);

  const handleQueryChange = (query: string) => {
    setCurrentQuery(query);
  };

  const viewPoemDetails = (poem: Poem) => {
    sessionStorage.setItem("selectedPoem", JSON.stringify(poem));
    navigate("/poem-details");
  };

  const viewBookDetails = (book: Book) => {
    navigate(`/book-details?id=${book.id}`);
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
    <div className="container px-4 py-6 pb-24 min-h-screen">
      <h1 className="text-2xl font-serif font-bold text-center mb-8 gradient-text">
        Search Library
      </h1>
      
      <Tabs 
        defaultValue="books" 
        value={contentType}
        onValueChange={(value) => setContentType(value as ContentType)}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="poems">Poems</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {contentType === "poems" && (
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
      )}
      
      <div className="relative">
        <div className="flex items-center mb-2">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder={contentType === "poems" ? `Search poems by ${searchType}...` : "Search books by title or author..."}
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
      
      <div className="mt-8">
        {loading ? (
          <div className="space-y-6">
            {contentType === "poems" ? (
              Array.from({ length: 3 }).map((_, i) => <PoemSkeleton key={i} />)
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-60 sm:h-72 glass-card rounded-lg animate-pulse" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {hasSearched && (
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-2">Search Results</h2>
                {contentType === "poems" && poemResults.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-foreground/70">No poems found</p>
                  </div>
                )}
                {contentType === "books" && bookResults.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-foreground/70">No books found</p>
                  </div>
                )}
              </div>
            )}

            {contentType === "poems" && poemResults.length > 0 && (
              <div className="space-y-6">
                {poemResults.map((poem, index) => (
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

            {contentType === "books" && bookResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {bookResults.map((book, index) => (
                  <div 
                    key={index}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <BookCard 
                      book={book}
                      onClick={() => viewBookDetails(book)}
                    />
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
