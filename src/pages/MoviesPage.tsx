import React, { useState, useMemo } from 'react';
import { Movie, Series, Category, Language } from '../types';
import { MovieCard } from '../components/MovieCard';
import { PosterGridControl } from '../components/PosterGridControl';
import { usePosterGridSize } from '../hooks/usePosterGridSize';
import { Film, Search } from 'lucide-react';

interface MoviesPageProps {
  movies: Movie[];
  categories: Category[];
  languages: Language[];
  favorites: string[];
  initialCategory?: string;
  onPlay: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onToggleFavorite: (item: Movie | Series) => void;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({
  movies,
  categories,
  languages,
  favorites,
  initialCategory = '',
  onPlay,
  onOpenDetails,
  onToggleFavorite,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>(initialCategory || 'all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'views' | 'newest' | 'title'>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const { gridSize, setGridSize, gridClasses } = usePosterGridSize();

  const filteredMovies = useMemo(() => {
    return movies
      .filter((m) => {
        if (m.isPublished === false || m.published === false) return false;
        if (selectedGenre !== 'all') {
          const matchCategory = (m.category || '').toLowerCase().includes(selectedGenre.toLowerCase());
          const matchGenre = m.genres?.some((g) => (g || '').toLowerCase().includes(selectedGenre.toLowerCase()));
          if (!matchCategory && !matchGenre) return false;
        }
        if (selectedLanguage !== 'all' && (m.language || '').toLowerCase() !== selectedLanguage.toLowerCase()) {
          return false;
        }
        if (selectedQuality !== 'all' && m.videoQuality !== selectedQuality) {
          return false;
        }
        if (searchQuery.trim() && !(m.title || '').toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
        if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [movies, selectedGenre, selectedLanguage, selectedQuality, sortBy, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Movies Catalog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Explore 4K UHD and 1080p blockbuster movies with multi-server playback and dual audio.
          </p>
        </div>

        {/* Quick Filter Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search movie titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Genre filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-zinc-800 border border-zinc-700/80 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="all">All Genres</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-zinc-800 border border-zinc-700/80 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="all">All Languages</option>
              {languages.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quality filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Quality</label>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="bg-zinc-800 border border-zinc-700/80 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="all">All Qualities</option>
              <option value="4K">4K UHD</option>
              <option value="1080p">1080p FHD</option>
              <option value="720p">720p HD</option>
            </select>
          </div>
        </div>

        {/* Sort selector */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700/80 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="rating">Top Rated (IMDb)</option>
            <option value="views">Most Viewed</option>
            <option value="newest">Release Year (Newest)</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Results Count & 3-Mode Grid Layout Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span>Showing {filteredMovies.length} movies</span>
          {(selectedGenre !== 'all' || selectedLanguage !== 'all' || selectedQuality !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedGenre('all');
                setSelectedLanguage('all');
                setSelectedQuality('all');
                setSearchQuery('');
              }}
              className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <PosterGridControl gridSize={gridSize} onChange={setGridSize} />
      </div>

      {/* Movie Grid */}
      {filteredMovies.length > 0 ? (
        <div className={gridClasses}>
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              item={movie}
              gridSize={gridSize}
              isFavorite={favorites.includes(movie.id)}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-3">
          <p className="text-zinc-400 text-sm">No movies match your current filter criteria.</p>
          <button
            onClick={() => {
              setSelectedGenre('all');
              setSelectedLanguage('all');
              setSelectedQuality('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
