import React, { useState } from 'react';
import { Movie, Series } from '../types';
import { MovieCard } from '../components/MovieCard';
import { PosterGridControl } from '../components/PosterGridControl';
import { usePosterGridSize } from '../hooks/usePosterGridSize';
import { Heart } from 'lucide-react';

interface DramasPageProps {
  movies: Movie[];
  series: Series[];
  favorites: string[];
  onPlay: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onToggleFavorite: (item: Movie | Series) => void;
}

export const DramasPage: React.FC<DramasPageProps> = ({
  movies,
  series,
  favorites,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'kdrama' | 'turkish' | 'asian'>('all');
  const { gridSize, setGridSize, gridClasses } = usePosterGridSize();

  // Filter drama titles
  const allDramas = [...movies, ...series].filter((item) => {
    const isDramaCategory = item.category?.toLowerCase().includes('drama');
    const isDramaGenre = item.genres?.some((g) => g.toLowerCase().includes('drama'));
    const isKorean = item.language?.toLowerCase() === 'korean';
    const isTurkish = item.language?.toLowerCase() === 'turkish';
    return isDramaCategory || isDramaGenre || isKorean || isTurkish;
  });

  const kdramas = allDramas.filter(
    (i) => i.language?.toLowerCase() === 'korean' || i.genres?.some((g) => g.toLowerCase().includes('k-drama'))
  );
  const turkishDramas = allDramas.filter(
    (i) => i.language?.toLowerCase() === 'turkish' || i.genres?.some((g) => g.toLowerCase().includes('turkish'))
  );
  const asianDramas = allDramas.filter(
    (i) => ['japanese', 'chinese', 'bengali', 'hindi'].includes(i.language?.toLowerCase() || '')
  );

  const displayList =
    activeTab === 'kdrama'
      ? kdramas
      : activeTab === 'turkish'
      ? turkishDramas
      : activeTab === 'asian'
      ? asianDramas
      : allDramas;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            International Dramas
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">
          Heartwarming romances, high-stakes revenge thrillers, and captivating K-Dramas & Turkish series.
        </p>
      </div>

      {/* Drama Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        {[
          { id: 'all', label: 'All Dramas', count: allDramas.length },
          { id: 'kdrama', label: 'K-Dramas (Korean)', count: kdramas.length },
          { id: 'turkish', label: 'Turkish Dramas', count: turkishDramas.length },
          { id: 'asian', label: 'Asian & Pan-Regional', count: asianDramas.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-zinc-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <PosterGridControl gridSize={gridSize} onChange={setGridSize} />

      {/* Grid */}
      <div className={gridClasses}>
        {displayList.map((item) => (
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
