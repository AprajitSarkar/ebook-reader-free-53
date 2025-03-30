
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book, BooksResponse, gutendexService } from "@/services/gutendexService";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let response: BooksResponse;
        
        if (searchQuery.trim()) {
          response = await gutendexService.searchBooks(searchQuery, currentPage);
        } else {
          response = await gutendexService.getPopularBooks(currentPage);
        }
        
        setBooks(response.results);
        setTotalBooks(response.count);
        setNextPage(response.next);
        setPrevPage(response.previous);
      } catch (err) {
        console.error("Failed to fetch books:", err);
        setError("Failed to load books. Please try again later.");
        toast.error("Failed to load books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, currentPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (nextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (prevPage) {
      setCurrentPage(currentPage - 1);
    }
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
      
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-60 sm:h-72 glass-card rounded-lg animate-pulse" />
          ))}
        </div>
      )}
      
      {error && !loading && (
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
      
      {!loading && !error && books.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          
          <Pagination className="mt-8">
            <PaginationContent>
              {prevPage && (
                <PaginationItem>
                  <PaginationPrevious onClick={handlePrevPage} />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationLink isActive>
                  Page {currentPage} of {Math.ceil(totalBooks / 32)}
                </PaginationLink>
              </PaginationItem>
              
              {nextPage && (
                <PaginationItem>
                  <PaginationNext onClick={handleNextPage} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
};

export default Books;
