
// Poetry service for accessing PoetryDB API
// API documentation: https://poetrydb.org/

export interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

interface PoemResponse {
  status: number;
  data: Poem[];
}

interface AuthorsResponse {
  authors: string[];
}

interface TitlesResponse {
  titles: string[];
}

export const poetryService = {
  // Get a list of authors
  getAuthors: async (): Promise<AuthorsResponse> => {
    try {
      const response = await fetch("https://poetrydb.org/author");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching authors:", error);
      throw error;
    }
  },

  // Get a list of titles
  getTitles: async (): Promise<TitlesResponse> => {
    try {
      const response = await fetch("https://poetrydb.org/title");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching titles:", error);
      throw error;
    }
  },

  // Get a random selection of poems
  getRandomPoems: async (count: number = 5): Promise<Poem[]> => {
    try {
      const response = await fetch(`https://poetrydb.org/random/${count}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Ensure we always return an array
    } catch (error) {
      console.error("Error fetching random poems:", error);
      throw error;
    }
  },

  // Search poems by title
  searchByTitle: async (title: string): Promise<Poem[]> => {
    try {
      const response = await fetch(`https://poetrydb.org/title/${encodeURIComponent(title)}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Ensure we always return an array
    } catch (error) {
      console.error(`Error searching poems by title "${title}":`, error);
      throw error;
    }
  },

  // Search poems by author
  searchByAuthor: async (author: string): Promise<Poem[]> => {
    try {
      const response = await fetch(`https://poetrydb.org/author/${encodeURIComponent(author)}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Ensure we always return an array
    } catch (error) {
      console.error(`Error searching poems by author "${author}":`, error);
      throw error;
    }
  },

  // Search poems by lines/content
  searchByLines: async (text: string): Promise<Poem[]> => {
    try {
      const response = await fetch(`https://poetrydb.org/lines/${encodeURIComponent(text)}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Ensure we always return an array
    } catch (error) {
      console.error(`Error searching poems by lines containing "${text}":`, error);
      throw error;
    }
  },
};
