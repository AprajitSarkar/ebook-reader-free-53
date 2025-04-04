
// Interface for a poem
export interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

// API URL for the PoetryDB
const API_URL = "https://poetrydb.org";

// Get a list of authors
const getAuthors = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/author`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.authors;
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw error;
  }
};

// Get poems by author
const getPoemsByAuthor = async (author: string): Promise<Poem[]> => {
  try {
    const response = await fetch(`${API_URL}/author/${encodeURIComponent(author)}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching poems by ${author}:`, error);
    throw error;
  }
};

// Get a random selection of poems
const getRandomPoems = async (count: number = 5): Promise<Poem[]> => {
  try {
    const response = await fetch(`${API_URL}/random/${count}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching random poems:`, error);
    throw error;
  }
};

// Get a list of titles
const getTitles = async (): Promise<{ titles: string[] }> => {
  try {
    const response = await fetch(`${API_URL}/title`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching titles:", error);
    throw error;
  }
};

// Search poems by title
const searchByTitle = async (query: string): Promise<Poem[]> => {
  try {
    const response = await fetch(`${API_URL}/title/${encodeURIComponent(query)}`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error searching poems by title ${query}:`, error);
    return [];
  }
};

// Search poems by author
const searchByAuthor = async (query: string): Promise<Poem[]> => {
  try {
    const response = await fetch(`${API_URL}/author/${encodeURIComponent(query)}`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error searching poems by author ${query}:`, error);
    return [];
  }
};

// Search poems by lines
const searchByLines = async (query: string): Promise<Poem[]> => {
  try {
    const response = await fetch(`${API_URL}/lines/${encodeURIComponent(query)}`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error searching poems by lines ${query}:`, error);
    return [];
  }
};

// Search poems by title, author, or lines
const searchPoems = async (query: string): Promise<Poem[]> => {
  try {
    // First try searching by title
    let response = await fetch(`${API_URL}/title/${encodeURIComponent(query)}`);
    let poems: Poem[] = [];
    
    if (response.ok) {
      const titlePoems = await response.json();
      if (!Array.isArray(titlePoems)) {
        // No results by title
      } else {
        poems = poems.concat(titlePoems);
      }
    }
    
    // Then try searching by author
    response = await fetch(`${API_URL}/author/${encodeURIComponent(query)}`);
    if (response.ok) {
      const authorPoems = await response.json();
      if (!Array.isArray(authorPoems)) {
        // No results by author
      } else {
        // Add author poems without duplicating ones we already have by title
        for (const poem of authorPoems) {
          if (!poems.some(p => p.title === poem.title && p.author === poem.author)) {
            poems.push(poem);
          }
        }
      }
    }
    
    // Optionally search by lines (partial content)
    response = await fetch(`${API_URL}/lines/${encodeURIComponent(query)}`);
    if (response.ok) {
      const linePoems = await response.json();
      if (!Array.isArray(linePoems)) {
        // No results by lines
      } else {
        // Add line poems without duplicating ones we already have
        for (const poem of linePoems) {
          if (!poems.some(p => p.title === poem.title && p.author === poem.author)) {
            poems.push(poem);
          }
        }
      }
    }
    
    // Sort by author name
    poems.sort((a, b) => a.author.localeCompare(b.author));
    
    return poems;
  } catch (error) {
    console.error(`Error searching poems for ${query}:`, error);
    throw error;
  }
};

export const poetryService = {
  getAuthors,
  getPoemsByAuthor,
  getRandomPoems,
  searchPoems,
  getTitles,
  searchByTitle,
  searchByAuthor,
  searchByLines
};
