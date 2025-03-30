
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "@/services/gutendexService";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";

const LikedBooks = () => {
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load liked books from local storage
    const loadLikedBooks = () => {
      try {
        const storedBooks = localStorage.getItem("likedBooks");
        if (storedBooks) {
          setLikedBooks(JSON.parse(storedBooks));
        }
      } catch (error) {
        console.error("Failed to load liked books:", error);
        toast.error("Failed to load your liked books");
      } finally {
        setLoading(false);
      }
    };

    loadLikedBooks();
  }, []);

  const handleRemoveBook = (bookId: number) => {
    try {
      const updatedBooks = likedBooks.filter(book => book.id !== bookId);
      setLikedBooks(updatedBooks);
      localStorage.setItem("likedBooks", JSON.stringify(updatedBooks));
      toast.success("Book removed from favorites");
    } catch (error) {
      console.error("Failed to remove book:", error);
      toast.error("Failed to remove book from favorites");
    }
  };

  const handleViewDetails = (bookId: number) => {
    navigate(`/book-details?id=${bookId}`);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-5 pb-28">
      <div className="sticky top-0 z-10 bg-background pt-2 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Favorite Books</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-60 sm:h-72 glass-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {likedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No books saved yet</h3>
              <p className="text-muted-foreground text-center my-2">
                Books you save as favorites will appear here
              </p>
              <Button 
                onClick={() => navigate("/books")} 
                variant="outline"
                className="mt-4"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Books
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {likedBooks.map((book) => (
                <div key={book.id} className="relative">
                  <BookCard 
                    book={book} 
                    onClick={() => handleViewDetails(book.id)} 
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBook(book.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LikedBooks;
