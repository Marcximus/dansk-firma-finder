
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  shouldFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false, shouldFocus = false }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-2">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          ref={inputRef}
          type="text"
          placeholder="Søg virksomheder efter navn, CVR, branche eller by..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12"
        />
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
  );
};

export default SearchBar;
