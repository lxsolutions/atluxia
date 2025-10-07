'use client';

import { useState, useRef, useEffect } from 'react';
import { SearchResult, searchManager } from '../lib/search';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = "Search across all modules...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim().length > 2) {
      const searchResults = searchManager.search(searchQuery);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.url;
    setIsOpen(false);
    setQuery('');
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'nomad':
        return '🌍';
      case 'polyverse':
        return '🌐';
      case 'everpath':
        return '📚';
      case 'critters':
        return '🐾';
      default:
        return '📄';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return '👤';
      case 'course':
        return '📖';
      case 'booking':
        return '🏨';
      case 'post':
        return '📝';
      case 'critter':
        return '🐾';
      case 'quest':
        return '🎯';
      default:
        return '📄';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-lg">
                  {getModuleIcon(result.module)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {getTypeIcon(result.type)}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {result.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-400 capitalize">
                      {result.module}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400 capitalize">
                      {result.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.trim().length > 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <p className="text-sm text-gray-500 text-center">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}