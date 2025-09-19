
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Building } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getSearchSuggestions, type SearchSuggestion } from '@/services/companyAPI';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  shouldFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false, shouldFocus = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Debounce function for search suggestions
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Debounced function to fetch suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setLoadingSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const newSuggestions = await getSearchSuggestions(searchQuery);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300),
    []
  );

  // Handle auto-focus with glow animation
  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      // Small delay to ensure the component is mounted
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Add glow animation class
          inputRef.current.classList.add('animate-glow-twice');
          // Remove the animation class after it completes
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.classList.remove('animate-glow-twice');
            }
          }, 6000); // Match the animation duration
        }
      }, 100);
    }
  }, [shouldFocus]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedGetSuggestions(value);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SearchBar: Form submitted with query:', query);
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.displayText);
    setShowSuggestions(false);
    onSearch(suggestion.name); // Use the actual company name for search
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            ref={inputRef}
            type="text"
            placeholder="Søg virksomheder efter navn, CVR, branche eller by..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="pl-10 h-12"
            autoComplete="off"
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {loadingSuggestions && (
                <div className="p-3 text-center">
                  <Spinner variant="default" size={16} />
                  <span className="ml-2 text-sm text-muted-foreground">Henter forslag...</span>
                </div>
              )}
              
              {!loadingSuggestions && suggestions.length > 0 && (
                <div className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.cvr}-${index}`}
                      ref={el => suggestionRefs.current[index] = el}
                      className={`px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-accent transition-colors ${
                        selectedIndex === index ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {suggestion.name}
                        </div>
                        {suggestion.city && (
                          <div className="text-xs text-muted-foreground">
                            {suggestion.city} • CVR: {suggestion.cvr}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="h-12 px-6">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner variant="default" size={16} />
              Søger...
            </div>
          ) : (
            'Søg'
          )}
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;
