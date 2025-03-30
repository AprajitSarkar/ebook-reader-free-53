
import { useState } from "react";
import { Book } from "@/services/gutendexService";
import { toast } from "@/lib/toast";

export function useBooks() {
  const [likedBooks, setLikedBooks] = useState<Book[]>(() => {
    try {
      const stored = localStorage.getItem('likedBooks');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error loading liked books from storage:", e);
      return [];
    }
  });

  const toggleLike = (book: Book) => {
    try {
      const isLiked = likedBooks.some(b => b.id === book.id);
      let newLikedBooks: Book[];
      
      if (isLiked) {
        newLikedBooks = likedBooks.filter(b => b.id !== book.id);
        toast.info("Book removed from favorites");
      } else {
        newLikedBooks = [...likedBooks, book];
        toast.success("Book added to favorites");
      }
      
      localStorage.setItem('likedBooks', JSON.stringify(newLikedBooks));
      setLikedBooks(newLikedBooks);
      return !isLiked;
    } catch (e) {
      console.error("Error updating liked books:", e);
      toast.error("Failed to update favorites");
      return false;
    }
  };

  const isLiked = (bookId: number) => {
    return likedBooks.some(book => book.id === bookId);
  };

  const clearAllLikedBooks = () => {
    try {
      localStorage.setItem('likedBooks', JSON.stringify([]));
      setLikedBooks([]);
      toast.success("All favorite books cleared");
    } catch (e) {
      console.error("Error clearing liked books:", e);
      toast.error("Failed to clear favorites");
    }
  };

  return {
    likedBooks,
    toggleLike,
    isLiked,
    clearAllLikedBooks
  };
}

export default useBooks;
