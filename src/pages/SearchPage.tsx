import React, { useState, useMemo, useEffect } from 'react';
import { Movie, Series, Category, Language } from '../types';
import { MovieCard } from '../components/MovieCard';
import { PosterGridControl } from '../components/PosterGridControl';
import { usePosterGridSize } from '../hooks/usePosterGridSize';
import { Search as SearchIcon, X } from 'lucide-react';

interface SearchPageProps {
  initialQuery?: string;
  movies: Movie[];
  series: Series[];
  categories: Category[];
  languages: Language[];
  favorites: string[];
  onPlay: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onToggleFavorite: (item: Movie | Series) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  movies,
  series,
  categories,
  languages,
  favorites,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'series'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const { gridSize, setGridSize, gridClasses } = usePosterGridSize();

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const results = useMemo(() => {
    const list = [...movies, ...series].filter((item) => {
      if (item.isPublished === false || item.published === false) return false;
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedLanguage !== 'all' && (item.language || '').toLowerCase() !== selectedLanguage.toLowerCase()) return false;
      if (selectedGenre !== 'all') {
        const matchCat = (item.category || '').toLowerCase().includes(selectedGenre.toLowerCase());
        const matchGenre = item.genres?.some((g) => (g || '').toLowerCase().includes(selectedGenre.toLowerCase()));
        if (!matchCat && !matchGenre) return false;
      }
      if (query.trim()) {
        const terms = query
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        // All entered keywords must match at least one attribute of the movie/series
        const matchesAllTerms = terms.every((term) => {
          const matchTitle = (item.title || '').toLowerCase().includes(term);
          const matchOrig = (item.originalTitle || '').toLowerCase().includes(term);
          const matchDesc = (item.description || '').toLowerCase().includes(term);
          const matchDirector = (item.director || '').toLowerCase().includes(term);
          const matchCast = item.cast?.some((c) => (c || '').toLowerCase().includes(term));
          const matchGenre = item.genres?.some((g) => (g || '').toLowerCase().includes(term));
          const matchCategory = (item.category || '').toLowerCase().includes(term);
          const matchLanguage = (item.language || '').toLowerCase().includes(term);
          const matchYear = String(item.releaseYear || '').includes(term);
          const matchQuality = item.type === 'movie' ? ((item as Movie).videoQuality || '').toLowerCase().includes(term) : false;
          const matchAudio = item.type === 'movie' ? (((item as Movie).audioInfo || '').toLowerCase().includes(term)) : false;

          return (
            matchTitle ||
            matchOrig ||
            matchDesc ||
            matchDirector ||
            matchCast ||
            matchGenre ||
            matchCategory ||
            matchLanguage ||
            matchYear ||
            matchQuality ||
            matchAudio
          );
        });

        if (!matchesAllTerms) return false;
      }
      return true;
    });

    return list;
  }, [movies, series, query, selectedType, selectedGenre, selectedLanguage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Search Bar Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Search CineBox4u
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by movie title, actor, director, genre, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-xl"
            autoFocus
          />
          <SearchIcon className="w-5 h-5 text-zinc-400 absolute left-4 top-4" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Media Type */}
          {(['all', 'movie', 'series'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                selectedType === type
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All Types' : type === 'movie' ? 'Movies Only' : 'Web Series'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Genre select */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5"
          >
            <option value="all">All Genres</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Language select */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5"
          >
            <option value="all">All Languages</option>
            {languages.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count & Reset */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Found {results.length} streaming titles</span>
        {(query || selectedType !== 'all' || selectedGenre !== 'all' || selectedLanguage !== 'all') && (
          <button
            onClick={() => {
              setQuery('');
              setSelectedType('all');
              setSelectedGenre('all');
              setSelectedLanguage('all');
            }}
            className="text-red-400 hover:text-red-300 font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      <PosterGridControl gridSize={gridSize} onChange={setGridSize} />

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className={gridClasses}>
          {results.map((item) => (
            <MovieCard
              key={item.id}
              item={item}
              gridSize={gridSize}
              isFavorite={favorites.includes(item.id)}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-3">
          <p className="text-zinc-400 text-sm">No movies or series found matching "{query}".</p>
          <p className="text-xs text-zinc-500">Try searching for "Action", "Cyberpunk", "Tokyo", or "Sintel".</p>
        </div>
      )}
    </div>
  );
};
