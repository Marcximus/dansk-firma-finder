
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Building, MapPin } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { searchCompanies, Company } from '@/services/companyAPI';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  shouldFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false, shouldFocus = false }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Handle search results
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchCompanies(debouncedQuery);
          setSearchResults(results.slice(0, 5)); // Limit to 5 suggestions
          setShowDropdown(true);
        } catch (error) {
          console.error('Search suggestions error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SearchBar: Form submitted with query:', query);
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query);
    }
  };

  const handleSuggestionClick = (company: Company) => {
    setQuery(company.name);
    setShowDropdown(false);
    onSearch(company.name);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            ref={inputRef}
            type="text"
            placeholder="Søg virksomheder efter navn, CVR, branche eller by..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
          />
          
          {/* Search Results Dropdown */}
          {showDropdown && (searchResults.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-[40vh] sm:max-h-[300px] overflow-hidden">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Søger...
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-[40vh] sm:max-h-[300px] overflow-y-auto">
                  {searchResults.map((company) => (
                    <div
                      key={company.cvr}
                      className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0 transition-colors text-left"
                      onClick={() => handleSuggestionClick(company)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Building className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-medium text-sm truncate text-left">
                            {company.name}
                          </div>
                          <div className="text-xs text-muted-foreground text-left">
                            CVR: {company.cvr}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 justify-start">
                            <MapPin className="h-3 w-3" />
                            {company.city}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="h-10 sm:h-12 px-3 sm:px-6 text-sm sm:text-base">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner variant="default" size={16} />
              <span className="hidden sm:inline">Søger...</span>
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
