
import { toast } from "@/lib/toast";

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
const CACHE_KEY_POEMS = "cached_poems";
const CACHE_KEY_TIMESTAMP = "cached_poems_timestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const poetryService = {
  // Cache poems for offline access
  cachePoems: (poems: Poem[]) => {
    try {
      localStorage.setItem(CACHE_KEY_POEMS, JSON.stringify(poems));
      localStorage.setItem(CACHE_KEY_TIMESTAMP, JSON.stringify(Date.now()));
    } catch (error) {
      console.error("Error caching poems:", error);
    }
  },

  // Get cached poems
  getCachedPoems: (): Poem[] => {
    try {
      const cachedPoems = localStorage.getItem(CACHE_KEY_POEMS);
      if (!cachedPoems) return [];
      return JSON.parse(cachedPoems);
    } catch (error) {
      console.error("Error getting cached poems:", error);
      return [];
    }
  },

  // Check if cache is valid
  isCacheValid: (): boolean => {
    try {
      const timestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
      if (!timestamp) return false;
      
      const cachedTime = JSON.parse(timestamp);
      const currentTime = Date.now();
      
      return currentTime - cachedTime < CACHE_DURATION;
    } catch (error) {
      console.error("Error checking cache validity:", error);
      return false;
    }
  },

  // Get a random poem
  getRandomPoem: async (): Promise<Poem[]> => {
    try {
      const response = await fetch(`${API_URL}/random`);
      if (!response.ok) throw new Error('Failed to fetch random poem');
      const poems = await response.json();
      return poems;
    } catch (error) {
      console.error("Error fetching random poem:", error);
      // Return cached poems if available
      const cachedPoems = poetryService.getCachedPoems();
      if (cachedPoems.length > 0) {
        const randomIndex = Math.floor(Math.random() * cachedPoems.length);
        return [cachedPoems[randomIndex]];
      }
      throw error;
    }
  },

  // Get multiple random poems
  getRandomPoems: async (count: number): Promise<Poem[]> => {
    try {
      const response = await fetch(`${API_URL}/random/${count}`);
      if (!response.ok) throw new Error(`Failed to fetch ${count} random poems`);
      const poems = await response.json();
      
      // Cache the poems for offline access
      poetryService.cachePoems([...poetryService.getCachedPoems(), ...poems]);
      
      return poems;
    } catch (error) {
      console.error(`Error fetching ${count} random poems:`, error);
      
      // If offline, use cached poems
      const cachedPoems = poetryService.getCachedPoems();
      if (cachedPoems.length > 0) {
        console.log("Using cached poems for offline access");
        toast.info("You're offline. Showing cached poems.");
        
        // Return random selection from cache
        const shuffled = [...cachedPoems].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
      }
      
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
      
      // If offline, search in cached poems
      const cachedPoems = poetryService.getCachedPoems();
      if (cachedPoems.length > 0) {
        console.log("Using cached poems for offline search");
        toast.info("You're offline. Searching in cached poems.");
        
        const lowerTitle = title.toLowerCase();
        return cachedPoems.filter(poem => 
          poem.title.toLowerCase().includes(lowerTitle)
        );
      }
      
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
      
      // If offline, search in cached poems
      const cachedPoems = poetryService.getCachedPoems();
      if (cachedPoems.length > 0) {
        console.log("Using cached poems for offline search");
        toast.info("You're offline. Searching in cached poems.");
        
        const lowerAuthor = author.toLowerCase();
        return cachedPoems.filter(poem => 
          poem.author.toLowerCase().includes(lowerAuthor)
        );
      }
      
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
      
      // If offline, search in cached poems
      const cachedPoems = poetryService.getCachedPoems();
      if (cachedPoems.length > 0) {
        console.log("Using cached poems for offline search");
        toast.info("You're offline. Searching in cached poems.");
        
        const lowerText = text.toLowerCase();
        return cachedPoems.filter(poem => 
          poem.lines.some(line => line.toLowerCase().includes(lowerText))
        );
      }
      
      throw error;
    }
  },
};
