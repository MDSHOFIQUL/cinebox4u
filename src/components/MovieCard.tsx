import React, { useState } from 'react';
import { Download, Info, Bookmark, Film } from 'lucide-react';
import { Movie, Series } from '../types';
import { PosterGridSize } from '../hooks/usePosterGridSize';
import { getMediaDetailPath } from '../utils/seo';

interface MovieCardProps {
  item: Movie | Series;
  isFavorite?: boolean;
  onPlay?: (item: Movie | Series) => void;
  onDownload?: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onToggleFavorite?: (item: Movie | Series) => void;
  gridSize?: PosterGridSize | 'compact';
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = React.memo(({
  item,
  isFavorite = false,
  onDownload,
  onOpenDetails,
  onToggleFavorite,
  gridSize = 'medium',
  priority = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const isMovie = item.type === 'movie';
  const movie = isMovie ? (item as Movie) : null;
  const series = !isMovie ? (item as Series) : null;

  const normalizedSize: PosterGridSize =
    gridSize === 'compact' ? 'medium' : gridSize;
  const isSmall = normalizedSize === 'small';
  const isLarge = normalizedSize === 'large';

  const qualityLabel =
    movie?.badgeQuality ||
    series?.badgeQuality ||
    (isMovie ? movie?.videoQuality : 'HD') ||
    'HD';

  const ratingScore = movie?.imdbRating || item.rating;

  const handleCardClick = () => {
    onOpenDetails(item);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(item);
    } else {
      onOpenDetails(item);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(item);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      aria-label={`${item.title} (${item.releaseYear}) — বিস্তারিত দেখুন`}
      className={`group relative flex flex-col bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-amber-500/80 transition-all duration-200 hover:shadow-2xl hover:shadow-amber-950/20 hover:-translate-y-1 cursor-pointer select-none active:scale-[0.98] touch-manipulation ${
        isLarge ? 'shadow-xl' : 'shadow-md'
      }`}
    >
      {/* Complete Vertical Poster (2:3 Aspect Ratio) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        {!imgError && item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={`${item.title}${item.releaseYear ? ` (${item.releaseYear})` : ''} ${isMovie ? 'Movie' : 'Series'} Poster`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-zinc-500">
            <Film className="w-8 h-8 mb-2 text-amber-500/70" />
            <span className="text-xs font-bold text-zinc-300 line-clamp-2">{item.title}</span>
          </div>
        )}

        {/* Scrim for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

        {/* Top Row: Release Tag & Quality Badge */}
        <div
          className={`absolute top-2 inset-x-2 flex items-center justify-between gap-1 pointer-events-none z-10 ${
            isSmall ? 'top-1.5 inset-x-1.5' : ''
          }`}
        >
          <span
            className={`px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-md font-black uppercase tracking-wider text-white border border-zinc-800 shadow ${
              isSmall ? 'text-[8px]' : 'text-[9px]'
            }`}
          >
            {item.releaseYear >= 2025 ? 'NEW' : item.type === 'series' ? 'SERIES' : 'MOVIE'}
          </span>

          <span
            className={`px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-black/85 backdrop-blur-md text-amber-400 border border-zinc-700/60 shadow ${
              isSmall ? 'text-[8px]' : 'text-[10px]'
            }`}
          >
            {qualityLabel}
          </span>
        </div>

        {/* Desktop Hover Overlay */}
        <div className="hidden sm:flex absolute inset-0 flex-col items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 backdrop-blur-[2px] p-3">
          <button
            type="button"
            onClick={handleDownloadClick}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black flex items-center justify-center shadow-lg shadow-amber-950/80 hover:scale-110 active:scale-95 transition cursor-pointer"
            aria-label={`Open details and download for ${item.title}`}
            title="বিস্তারিত ও ডাউনলোড"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-zinc-900/95 text-[11px] font-bold text-white border border-zinc-700 shadow-md flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>বিস্তারিত দেখুন</span>
            </span>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={handleBookmarkClick}
                className={`p-1.5 rounded-full transition cursor-pointer ${
                  isFavorite
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'bg-zinc-800/95 text-zinc-300 hover:text-white hover:bg-zinc-700'
                }`}
                title={isFavorite ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dark Gray Card Info Section: Title, Release Year, Language, Quality, Description */}
      <div
        className={`flex-1 flex flex-col justify-between bg-zinc-900/95 ${
          isSmall ? 'p-2' : isLarge ? 'p-3.5 sm:p-4' : 'p-2.5 sm:p-3'
        }`}
      >
        <div className="space-y-1">
          <h3
            className={`font-extrabold text-white group-hover:text-amber-400 transition-colors leading-snug ${
              isSmall
                ? 'text-[11px] sm:text-xs line-clamp-1'
                : isLarge
                ? 'text-sm sm:text-base line-clamp-2'
                : 'text-xs sm:text-sm line-clamp-1'
            }`}
            title={item.title}
          >
            <a
              href={getMediaDetailPath(item)}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCardClick();
                }
              }}
              className="block focus:outline-hidden focus-visible:underline"
            >
              {item.title}
            </a>
          </h3>

          {/* Clean unboxed metadata: Year · Language · Quality */}
          <div
            className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-zinc-400 tabular-nums ${
              isSmall ? 'text-[9px] sm:text-[10px]' : 'text-[11px]'
            }`}
          >
            <span className="text-amber-400 font-bold">{item.releaseYear}</span>
            {item.language && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[95px] sm:max-w-[130px] text-zinc-300">
                  {item.language}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-zinc-200">{qualityLabel}</span>
          </div>

          {/* Movie Description */}
          {item.description && (
            <p
              className={`text-zinc-400 leading-snug ${
                isSmall
                  ? 'hidden sm:line-clamp-1 text-[10px] mt-1'
                  : isLarge
                  ? 'line-clamp-3 text-xs mt-1.5'
                  : 'line-clamp-2 text-[11px] mt-1'
              }`}
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Optional Rating & Category Footer */}
        {!isSmall && (ratingScore || item.category) && (
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-zinc-800/70 text-[10px] text-zinc-400">
            <span className="truncate">{item.category || item.genres?.[0] || ''}</span>
            {ratingScore ? (
              <span className="text-amber-400 font-bold shrink-0 tabular-nums">
                ★ {Number(ratingScore).toFixed(1)}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
});
