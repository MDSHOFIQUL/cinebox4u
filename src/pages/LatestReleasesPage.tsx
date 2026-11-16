import React from 'react';
import { Movie, Series } from '../types';
import { MovieCard } from '../components/MovieCard';
import { PosterGridControl } from '../components/PosterGridControl';
import { usePosterGridSize } from '../hooks/usePosterGridSize';
import { Sparkles } from 'lucide-react';

interface LatestReleasesPageProps {
  movies: Movie[];
  series: Series[];
  favorites: string[];
  onPlay: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onToggleFavorite: (item: Movie | Series) => void;
}

export const LatestReleasesPage: React.FC<LatestReleasesPageProps> = ({
  movies,
  series,
  favorites,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
}) => {
  const { gridSize, setGridSize, gridClasses } = usePosterGridSize();

  const latestList = [...movies, ...series]
    .filter((m) => m.isPublished !== false && m.published !== false)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Latest Releases
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">
          Fresh premiere drops, newly added 4K remasters, and new episode broadcasts.
        </p>
      </div>

      <PosterGridControl gridSize={gridSize} onChange={setGridSize} />

      <div className={gridClasses}>
        {latestList.map((item) => (
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
    </div>
  );
};
