'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { globalSearch, SearchResult } from '@/app/actions/global-search';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({
  placeholder,
  className,
}: GlobalSearchProps) {
  const locale = useLocale();
  const t = useTranslations('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setTotalResults(0);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await globalSearch(query.trim(), locale);
        const allResults = [
          ...searchResults.strategies,
          ...searchResults.modules,
          ...searchResults.questions,
          ...searchResults.projects,
          ...searchResults.businesses,
          ...searchResults.organizations,
        ];

        setResults(allResults);
        setTotalResults(searchResults.total);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotalResults(0);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setTotalResults(0);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      strategy: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      module: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      question: 'bg-green-500/10 text-green-500 border-green-500/20',
      project: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      business: 'bg-red-500/10 text-red-500 border-red-500/20',
      organization: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    };
    return (
      colors[type as keyof typeof colors] ||
      'bg-gray-500/10 text-gray-500 border-gray-500/20'
    );
  };

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || t('placeholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-card pl-10 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {(query || isLoading) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
            {query && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-transparent"
                onClick={handleClear}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-border bg-card shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <>
                {/* Results Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    {t('results', { count: totalResults, query })}
                  </p>
                </div>

                {/* Results List */}
                <div className="py-2">
                  {results.map(result => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.url}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate hover:text-yellow-500 transition-colors">
                              {result.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs capitalize',
                                getTypeColor(result.type)
                              )}
                            >
                              {t(`categories.${result.type}`)}
                            </Badge>
                          </div>
                          {result.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          {result.category && (
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              {result.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('noResults', { query })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('trySearching')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
