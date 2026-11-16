import React, { useState, useMemo } from 'react';
import { Movie, Series, Language } from '../types';
import { MovieCard } from '../components/MovieCard';
import { PosterGridControl } from '../components/PosterGridControl';
import { usePosterGridSize } from '../hooks/usePosterGridSize';
import { Tv, Search } from 'lucide-react';

interface SeriesPageProps {
  series: Series[];
  languages: Language[];
  favorites: string[];
  onPlay: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onToggleFavorite: (item: Movie | Series) => void;
}

export const SeriesPage: React.FC<SeriesPageProps> = ({
  series,
  languages,
  favorites,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'views' | 'episodes'>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const { gridSize, setGridSize, gridClasses } = usePosterGridSize();

  const filteredSeries = useMemo(() => {
    return series
      .filter((s) => {
        if (s.isPublished === false || s.published === false) return false;
        if (selectedLanguage !== 'all' && (s.language || '').toLowerCase() !== selectedLanguage.toLowerCase()) {
          return false;
        }
        if (searchQuery.trim() && !(s.title || '').toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
        if (sortBy === 'episodes') return (b.totalEpisodes || 0) - (a.totalEpisodes || 0);
        return 0;
      });
  }, [series, selectedLanguage, sortBy, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tv className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Web Series & TV Shows
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Stream entire seasons, binge original series, and track episodes seamlessly.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search web series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700/80 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="rating">Top Rated</option>
            <option value="views">Most Viewed</option>
            <option value="episodes">Most Episodes</option>
          </select>
        </div>
      </div>

      <PosterGridControl gridSize={gridSize} onChange={setGridSize} />

      {/* Grid */}
      <div className={gridClasses}>
        {filteredSeries.map((s) => (
          <MovieCard
            key={s.id}
            item={s}
            gridSize={gridSize}
            isFavorite={favorites.includes(s.id)}
            onPlay={onPlay}
            onOpenDetails={onOpenDetails}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
