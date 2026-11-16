import React, { useState, useEffect } from 'react';
import { Download, Info, Bookmark, Star, ChevronLeft, ChevronRight, Volume2, Sparkles } from 'lucide-react';
import { Movie, Series } from '../types';

interface HeroBannerProps {
  items: (Movie | Series)[];
  onPlay?: (item: Movie | Series) => void;
  onDownload?: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onToggleFavorite?: (item: Movie | Series) => void;
  favorites: string[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  items,
  onPlay,
  onDownload,
  onOpenDetails,
  onToggleFavorite,
  favorites,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto advance every 7 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  const isFavorite = favorites.includes(current.id);
  const isMovie = current.type === 'movie';
  const movie = isMovie ? (current as Movie) : null;
  const series = !isMovie ? (current as Series) : null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div className="relative w-full h-[70vh] sm:h-[75vh] lg:h-[82vh] overflow-hidden bg-black select-none">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <img
          src={current.backdropUrl || current.posterUrl}
          alt={current.title}
          className="w-full h-full object-cover object-top opacity-50 sm:opacity-60 scale-105 transition-all duration-1000 ease-out"
        />

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/70 to-transparent w-full lg:w-2/3" />
      </div>

      {/* Hero Content Area */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 lg:pb-24">
        <div className="max-w-2xl space-y-4">
          {/* Badge & Rating Tag */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md shadow-red-900/50">
              <Sparkles className="w-3 h-3" />
              Featured Premiere
            </span>

            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-black">
              <Star className="w-3 h-3 fill-black" />
              {current.rating?.toFixed(1)} Rating
            </span>

            <span className="px-2 py-0.5 rounded text-[11px] font-bold text-zinc-300 bg-zinc-900/80 border border-zinc-700/60">
              {current.releaseYear}
            </span>

            <span className="px-2 py-0.5 rounded text-[11px] font-bold text-zinc-300 bg-zinc-900/80 border border-zinc-700/60 uppercase">
              {current.language}
            </span>

            <span className="px-2 py-0.5 rounded text-[11px] font-black text-red-400 bg-red-950/60 border border-red-800/60 uppercase">
              {isMovie ? movie?.videoQuality || '4K UHD' : `${series?.seasonsCount || 1} SEASONS`}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {current.title}
          </h1>

          {/* Genres row */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-300">
            {current.genres?.map((genre, idx) => (
              <React.Fragment key={genre}>
                <span className="font-semibold text-zinc-300">{genre}</span>
                {idx < current.genres.length - 1 && <span className="text-red-500">•</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed line-clamp-3 sm:line-clamp-4 max-w-xl">
            {current.description}
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onDownload ? onDownload(current) : onOpenDetails(current)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-sm flex items-center gap-2.5 shadow-xl shadow-amber-950/60 transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>ডাউনলোড করুন (Download Movie)</span>
            </button>

            <button
              onClick={() => onOpenDetails(current)}
              className="px-5 py-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-sm flex items-center gap-2 border border-zinc-700/60 transition"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>

            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(current)}
                className={`p-3 rounded-xl border transition ${
                  isFavorite
                    ? 'bg-red-600/20 border-red-500 text-red-400'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
                title={isFavorite ? 'Saved to Watchlist' : 'Add to Watchlist'}
              >
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-red-600/80 text-white backdrop-blur-xs transition border border-white/10 hidden sm:block"
            aria-label="Previous Featured Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-red-600/80 text-white backdrop-blur-xs transition border border-white/10 hidden sm:block"
            aria-label="Next Featured Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 right-8 flex items-center gap-1.5 z-20">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-6 bg-red-600' : 'w-2 bg-zinc-600/70 hover:bg-zinc-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
