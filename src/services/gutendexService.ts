
import { toast } from "@/lib/toast";

// Define the type for a book author
export interface Author {
  name: string;
  birth_year?: number;
  death_year?: number;
}

// Define the type for a book
export interface Book {
  id: number;
  title: string;
  authors: Author[];
  translators: Author[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean | null;
  media_type: string;
  formats: Record<string, string>;
  download_count: number;
}

// Define the type for the API response
export interface BooksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}

// Base URL for the Gutendex API
const BASE_URL = "https://gutendex.com";

// Get books from the Gutendex API
const fetchBooks = async (endpoint: string, page: number = 1): Promise<BooksResponse> => {
  try {
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

// Get popular books (sorted by download count)
const getPopularBooks = async (page: number = 1): Promise<BooksResponse> => {
  return fetchBooks("/books?sort=popular", page);
};

// Search for books by title or author
const searchBooks = async (query: string, page: number = 1): Promise<BooksResponse> => {
  return fetchBooks(`/books?search=${encodeURIComponent(query)}`, page);
};

// Get details for a specific book by ID
const getBookById = async (id: number): Promise<Book> => {
  try {
    const response = await fetch(`${BASE_URL}/books/${id}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching book with ID ${id}:`, error);
    throw error;
  }
};

// Get text content of a book from a URL
const getTextContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch text content: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error("Error fetching text content:", error);
    toast.error("Failed to load book content");
    throw error;
  }
};

export const gutendexService = {
  getPopularBooks,
  searchBooks,
  getBookById,
  getTextContent
};
