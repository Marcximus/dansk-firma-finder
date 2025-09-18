
import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export interface SearchBarRef {
  focusAndGlow: () => void;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(({ onSearch, isLoading = false }, ref) => {
  const [query, setQuery] = useState('');
  const [isGlowing, setIsGlowing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusAndGlow: () => {
      // Focus the input
      inputRef.current?.focus();
      
      // Trigger glow animation
      setIsGlowing(true);
      
      // Reset glow after animation completes
      setTimeout(() => {
        setIsGlowing(false);
      }, 4000);
    }
  }));

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
          className={`pl-10 h-12 transition-all duration-300 ${
            isGlowing ? 'animate-glow-twice border-primary' : ''
          }`}
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
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
