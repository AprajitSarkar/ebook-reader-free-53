
import { useState, useEffect } from "react";
import { Book } from "@/services/gutendexService";
import { useNavigate } from "react-router-dom";
import BookCard from "@/components/BookCard";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const LikedBooks = () => {
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadLikedBooks();
  }, []);

  const loadLikedBooks = () => {
    try {
      const booksFromStorage = localStorage.getItem('likedBooks');
      if (booksFromStorage) {
        setLikedBooks(JSON.parse(booksFromStorage));
      }
    } catch (error) {
      console.error("Error loading liked books:", error);
      toast.error("Failed to load your favorite books");
    }
  };

  const handleRemoveBook = (bookId: number) => {
    try {
      const updatedBooks = likedBooks.filter(book => book.id !== bookId);
      localStorage.setItem('likedBooks', JSON.stringify(updatedBooks));
      setLikedBooks(updatedBooks);
      toast.success("Book removed from favorites");
    } catch (error) {
      console.error("Error removing book:", error);
      toast.error("Failed to remove book");
    }
  };

  const handleClearAll = () => {
    try {
      localStorage.setItem('likedBooks', JSON.stringify([]));
      setLikedBooks([]);
      setShowClearConfirm(false);
      toast.success("All favorite books cleared");
    } catch (error) {
      console.error("Error clearing books:", error);
      toast.error("Failed to clear books");
    }
  };

  const handleViewBook = (bookId: number) => {
    navigate(`/book-details?id=${bookId}`);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-5 pb-28">
      <div className="sticky top-0 z-10 bg-background pt-2 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center">
            <Heart className="mr-2 h-6 w-6 text-red-500" /> Favorite Books
          </h1>
          
          {likedBooks.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {likedBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No favorite books yet</h3>
          <p className="text-muted-foreground mb-6">
            Your saved books will appear here
          </p>
          <Button onClick={() => navigate('/books')}>
            Browse Books
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {likedBooks.map((book) => (
              <div key={book.id} className="relative group">
                <BookCard 
                  book={book} 
                  onClick={() => handleViewBook(book.id)} 
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveBook(book.id);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-background/80 p-1
                           opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove from favorites"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all favorite books?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all books from your favorites list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LikedBooks;
