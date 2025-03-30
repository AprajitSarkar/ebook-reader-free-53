
// Gutendex API service for accessing Project Gutenberg books
// API documentation: https://gutendex.com/

export interface Author {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

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

export interface BooksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}

const BASE_URL = "https://gutendex.com/books";

export const gutendexService = {
  // Get popular books (sorted by download count)
  getPopularBooks: async (page: number = 1): Promise<BooksResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/?page=${page}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching popular books:", error);
      throw error;
    }
  },

  // Search books by title, author, or topic
  searchBooks: async (query: string, page: number = 1): Promise<BooksResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/?search=${encodeURIComponent(query)}&page=${page}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error searching books:", error);
      throw error;
    }
  },

  // Get a specific book by ID
  getBookById: async (id: number): Promise<Book> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching book with ID ${id}:`, error);
      throw error;
    }
  },

  // Get books by language
  getBooksByLanguage: async (language: string, page: number = 1): Promise<BooksResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/?languages=${language}&page=${page}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching books in ${language}:`, error);
      throw error;
    }
  },

  // Get the text content of a book
  getTextContent: async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.text();
    } catch (error) {
      console.error("Error fetching text content:", error);
      throw error;
    }
  }
};
