import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function Search({ placeholder = 'Search...', className, onSearch }: SearchProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative w-full max-w-sm ${className}`}>
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="w-full pl-8 bg-background"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
