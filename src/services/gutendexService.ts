
import { toast } from "@/lib/toast";

export interface Person {
  birth_year: number | null;
  death_year: number | null;
  name: string;
}

export interface Format {
  [mimeType: string]: string;
}

export interface Book {
  id: number;
  title: string;
  subjects: string[];
  authors: Person[];
  translators: Person[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean | null;
  media_type: string;
  formats: Format;
  download_count: number;
  summaries?: string[];
}

export interface BooksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}

const API_URL = "https://gutendex.com";
const CACHE_KEY_BOOKS = "cached_books";
const CACHE_KEY_BOOKS_TIMESTAMP = "cached_books_timestamp";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const gutendexService = {
  // Cache books for offline access
  cacheBooks: (books: Book[]) => {
    try {
      const existingBooksStr = localStorage.getItem(CACHE_KEY_BOOKS);
      const existingBooks: Book[] = existingBooksStr ? JSON.parse(existingBooksStr) : [];
      
      // Merge new books with existing ones, avoiding duplicates by ID
      const bookIds = new Set(existingBooks.map(book => book.id));
      const newBooks = [...existingBooks];
      
      for (const book of books) {
        if (!bookIds.has(book.id)) {
          newBooks.push(book);
          bookIds.add(book.id);
        }
      }
      
      localStorage.setItem(CACHE_KEY_BOOKS, JSON.stringify(newBooks));
      localStorage.setItem(CACHE_KEY_BOOKS_TIMESTAMP, JSON.stringify(Date.now()));
    } catch (error) {
      console.error("Error caching books:", error);
    }
  },

  // Get cached books
  getCachedBooks: (): Book[] => {
    try {
      const cachedBooks = localStorage.getItem(CACHE_KEY_BOOKS);
      if (!cachedBooks) return [];
      return JSON.parse(cachedBooks);
    } catch (error) {
      console.error("Error getting cached books:", error);
      return [];
    }
  },

  // Check if cache is valid
  isCacheValid: (): boolean => {
    try {
      const timestamp = localStorage.getItem(CACHE_KEY_BOOKS_TIMESTAMP);
      if (!timestamp) return false;
      
      const cachedTime = JSON.parse(timestamp);
      const currentTime = Date.now();
      
      return currentTime - cachedTime < CACHE_DURATION;
    } catch (error) {
      console.error("Error checking book cache validity:", error);
      return false;
    }
  },

  // Get popular books
  getPopularBooks: async (page: number = 1): Promise<BooksResponse> => {
    try {
      const response = await fetch(`${API_URL}/books?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch popular books');
      const data: BooksResponse = await response.json();
      
      // Cache the books for offline access
      gutendexService.cacheBooks(data.results);
      
      return data;
    } catch (error) {
      console.error("Error fetching popular books:", error);
      
      // If offline, use cached books
      const cachedBooks = gutendexService.getCachedBooks();
      if (cachedBooks.length > 0) {
        console.log("Using cached books for offline access");
        toast.info("You're offline. Showing cached books.");
        
        // Simulate pagination with cached books
        const start = (page - 1) * 32;
        const end = start + 32;
        const paginatedBooks = cachedBooks.slice(start, end);
        
        return {
          count: cachedBooks.length,
          next: end < cachedBooks.length ? `page=${page + 1}` : null,
          previous: page > 1 ? `page=${page - 1}` : null,
          results: paginatedBooks
        };
      }
      
      throw error;
    }
  },

  // Search books
  searchBooks: async (query: string, page: number = 1): Promise<BooksResponse> => {
    try {
      const response = await fetch(`${API_URL}/books?search=${encodeURIComponent(query)}&page=${page}`);
      if (!response.ok) throw new Error(`Failed to search books: ${query}`);
      const data: BooksResponse = await response.json();
      
      // Cache the books for offline access
      gutendexService.cacheBooks(data.results);
      
      return data;
    } catch (error) {
      console.error(`Error searching books for ${query}:`, error);
      
      // If offline, search in cached books
      const cachedBooks = gutendexService.getCachedBooks();
      if (cachedBooks.length > 0) {
        console.log("Using cached books for offline search");
        toast.info("You're offline. Searching in cached books.");
        
        const lowerQuery = query.toLowerCase();
        const filteredBooks = cachedBooks.filter(book => 
          book.title.toLowerCase().includes(lowerQuery) || 
          book.authors.some(author => author.name.toLowerCase().includes(lowerQuery))
        );
        
        // Simulate pagination with filtered cached books
        const start = (page - 1) * 32;
        const end = start + 32;
        const paginatedBooks = filteredBooks.slice(start, end);
        
        return {
          count: filteredBooks.length,
          next: end < filteredBooks.length ? `page=${page + 1}` : null,
          previous: page > 1 ? `page=${page - 1}` : null,
          results: paginatedBooks
        };
      }
      
      throw error;
    }
  },

  // Get book by ID
  getBookById: async (id: number): Promise<Book> => {
    try {
      const response = await fetch(`${API_URL}/books/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch book with ID: ${id}`);
      const book: Book = await response.json();
      
      // Cache the book for offline access
      gutendexService.cacheBooks([book]);
      
      return book;
    } catch (error) {
      console.error(`Error fetching book with ID ${id}:`, error);
      
      // If offline, try to find book in cache
      const cachedBooks = gutendexService.getCachedBooks();
      const cachedBook = cachedBooks.find(book => book.id === id);
      
      if (cachedBook) {
        console.log("Using cached book for offline access");
        toast.info("You're offline. Showing cached book.");
        return cachedBook;
      }
      
      throw error;
    }
  },

  // Get text content from URL
  getTextContent: async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch text content');
      return await response.text();
    } catch (error) {
      console.error("Error fetching text content:", error);
      throw error;
    }
  }
};
