
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  isLoading?: boolean;
  onQueryChange?: (query: string) => void;
}

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search for poems...", 
  suggestions = [],
  isLoading = false,
  onQueryChange
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    if (onQueryChange) onQueryChange("");
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (onQueryChange) onQueryChange(value);
    setIsOpen(value.length > 0);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto relative" ref={commandRef}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <Input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-secondary/30 rounded-full px-5 py-3 h-auto pl-12 pr-10 
                     text-foreground outline-none border border-transparent
                     focus:border-primary/50 transition-all"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/60" size={18} />
          
          {query && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute w-full mt-1 z-50">
          <Command className="rounded-lg border shadow-md">
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Loading suggestions...</CommandEmpty>
              ) : (
                <>
                  {suggestions.length === 0 ? (
                    <CommandEmpty>No suggestions found</CommandEmpty>
                  ) : (
                    <CommandGroup heading="Suggestions">
                      {suggestions.slice(0, 5).map((suggestion, index) => (
                        <CommandItem 
                          key={index} 
                          onSelect={() => handleSuggestionClick(suggestion)}
                          className="cursor-pointer"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          <span>{suggestion}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
