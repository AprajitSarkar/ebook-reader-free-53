
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Book, BooksResponse, gutendexService } from "@/services/gutendexService";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastBookElementRef = useRef<HTMLDivElement | null>(null);

  // Function to load books (either search results or popular books)
  const loadBooks = async (page: number, query: string, append: boolean = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let response: BooksResponse;
      
      if (query.trim()) {
        response = await gutendexService.searchBooks(query, page);
      } else {
        response = await gutendexService.getPopularBooks(page);
      }
      
      if (append) {
        setBooks(prev => [...prev, ...response.results]);
      } else {
        setBooks(response.results);
      }
      
      setTotalBooks(response.count);
      setHasMore(response.next !== null);
    } catch (err) {
      console.error("Failed to fetch books:", err);
      setError("Failed to load books. Please try again later.");
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBooks(1, searchQuery, false);
  }, [searchQuery]);

  // Load more books when scrolling to bottom
  const lastBookRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => {
          const nextPage = prevPage + 1;
          loadBooks(nextPage, searchQuery, true);
          return nextPage;
        });
      }
    });
    
    if (node) {
      lastBookElementRef.current = node;
      observer.current.observe(node);
    }
  }, [loading, loadingMore, hasMore, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-5 pb-28">
      <div className="sticky top-0 z-10 bg-background pt-2 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">eBooks Library</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
        
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search books by title or author..." 
          icon={<Search className="h-4 w-4" />}
        />
      </div>
      
      {loading && books.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-60 sm:h-72 glass-card rounded-lg animate-pulse" />
          ))}
        </div>
      )}
      
      {error && !loading && books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-red-400">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}
      
      {!loading && !error && books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">No books found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? `No results for "${searchQuery}"` : "No books available right now"}
          </p>
        </div>
      )}
      
      {books.length > 0 && (
        <div className="pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book, index) => {
              // Last item gets the ref for infinite scrolling
              if (index === books.length - 1) {
                return (
                  <div key={`${book.id}-${index}`} ref={lastBookRef}>
                    <BookCard book={book} />
                  </div>
                );
              } else {
                return <BookCard key={`${book.id}-${index}`} book={book} />;
              }
            })}
          </div>
          
          {loadingMore && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span>Loading more books...</span>
              </div>
            </div>
          )}
          
          {!hasMore && books.length > 0 && (
            <div className="text-center text-muted-foreground mt-8">
              You've reached the end of the list
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Books;
