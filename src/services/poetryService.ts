
export interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: number | string;
}

export interface Author {
  authors: string[];
}

export interface Title {
  titles: string[];
}

const API_URL = "https://poetrydb.org";

export const poetryService = {
  // Get a random poem
  getRandomPoem: async (): Promise<Poem[]> => {
    try {
      const response = await fetch(`${API_URL}/random`);
      if (!response.ok) throw new Error('Failed to fetch random poem');
      return await response.json();
    } catch (error) {
      console.error("Error fetching random poem:", error);
      throw error;
    }
  },

  // Get multiple random poems
  getRandomPoems: async (count: number): Promise<Poem[]> => {
    try {
      const response = await fetch(`${API_URL}/random/${count}`);
      if (!response.ok) throw new Error(`Failed to fetch ${count} random poems`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${count} random poems:`, error);
      throw error;
    }
  },

  // Get all authors
  getAuthors: async (): Promise<Author> => {
    try {
      const response = await fetch(`${API_URL}/author`);
      if (!response.ok) throw new Error('Failed to fetch authors');
      return await response.json();
    } catch (error) {
      console.error("Error fetching authors:", error);
      throw error;
    }
  },

  // Get all titles
  getTitles: async (): Promise<Title> => {
    try {
      const response = await fetch(`${API_URL}/title`);
      if (!response.ok) throw new Error('Failed to fetch titles');
      return await response.json();
    } catch (error) {
      console.error("Error fetching titles:", error);
      throw error;
    }
  },

  // Search poems by title
  searchByTitle: async (title: string): Promise<Poem[]> => {
    try {
      const response = await fetch(`${API_URL}/title/${encodeURIComponent(title)}`);
      if (!response.ok) throw new Error(`Failed to search poems by title: ${title}`);
      return await response.json();
    } catch (error) {
      console.error(`Error searching poems by title ${title}:`, error);
      throw error;
    }
  },

  // Search poems by author
  searchByAuthor: async (author: string): Promise<Poem[]> => {
    try {
      const response = await fetch(`${API_URL}/author/${encodeURIComponent(author)}`);
      if (!response.ok) throw new Error(`Failed to search poems by author: ${author}`);
      return await response.json();
    } catch (error) {
      console.error(`Error searching poems by author ${author}:`, error);
      throw error;
    }
  },

  // Search poems by text content
  searchByLines: async (text: string): Promise<Poem[]> => {
    try {
      const response = await fetch(`${API_URL}/lines/${encodeURIComponent(text)}`);
      if (!response.ok) throw new Error(`Failed to search poems by text: ${text}`);
      return await response.json();
    } catch (error) {
      console.error(`Error searching poems by text ${text}:`, error);
      throw error;
    }
  },
};
