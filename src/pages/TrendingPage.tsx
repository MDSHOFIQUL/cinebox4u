import React from 'react';
import { Movie, Series } from '../types';
import { MovieCard } from '../components/MovieCard';
import { PosterGridControl } from '../components/PosterGridControl';
import { usePosterGridSize } from '../hooks/usePosterGridSize';
import { Flame } from 'lucide-react';

interface TrendingPageProps {
  movies: Movie[];
  series: Series[];
  favorites: string[];
  onPlay: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onToggleFavorite: (item: Movie | Series) => void;
}

export const TrendingPage: React.FC<TrendingPageProps> = ({
  movies,
  series,
  favorites,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
}) => {
  const { gridSize, setGridSize, gridClasses } = usePosterGridSize();

  const trendingList = [...movies, ...series]
    .filter((m) => m.isPublished !== false && m.published !== false)
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Top 10 Trending Today
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">
          The most streamed and discussed movies and series across the CineBox4u network.
        </p>
      </div>

      <PosterGridControl gridSize={gridSize} onChange={setGridSize} />

      <div className={gridClasses}>
        {trendingList.map((item, index) => (
          <div key={item.id} className="relative">
            <div className="absolute -top-2 -left-2 z-20 w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-xs flex items-center justify-center shadow-lg border border-red-400/50 pointer-events-none">
              #{index + 1}
            </div>
            <MovieCard
              item={item}
              gridSize={gridSize}
              isFavorite={favorites.includes(item.id)}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
