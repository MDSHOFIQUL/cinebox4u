import React, { useMemo, useState, useEffect } from 'react';
import { MovieCard } from '../components/MovieCard';
import { PosterGridControl } from '../components/PosterGridControl';
import { usePosterGridSize } from '../hooks/usePosterGridSize';
import { Movie, Series, Category, WatchHistoryItem } from '../types';
import { Flame, Play, Calendar, Download, Sparkles, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { FranchiseCollection } from '../components/FranchiseModal';

interface HomePageProps {
  movies: Movie[];
  series: Series[];
  categories: Category[];
  watchHistory: WatchHistoryItem[];
  favorites: string[];
  onPlay: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onToggleFavorite: (item: Movie | Series) => void;
  onSelectCategory: (categorySlug: string) => void;
  onNavigateTab: (tab: string) => void;
  onSelectFranchise?: (franchise: FranchiseCollection) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  movies,
  series = [],
  favorites,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
  onNavigateTab,
}) => {
  // Only hide explicitly unpublished/drafted items; keep Firebase console additions without flag visible
  const visibleMovies = useMemo(
    () => movies.filter((m) => m.isPublished !== false && m.published !== false),
    [movies]
  );

  const visibleSeries = useMemo(
    () => series.filter((s) => s.isPublished !== false && s.published !== false),
    [series]
  );

  // 1. Featured Spotlight Movies from Firebase (filtered by isFeatured or latest additions)
  const featuredMovies = useMemo(() => {
    const explicitlyFeatured = visibleMovies.filter((m) => m.isFeatured);
    if (explicitlyFeatured.length > 0) {
      return explicitlyFeatured;
    }
    return visibleMovies.slice(0, 5);
  }, [visibleMovies]);

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Auto-rotate featured hero spotlight every 7 seconds if multiple featured items exist
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  const currentHero = featuredMovies[activeHeroIndex] || visibleMovies[0];

  // 3-Mode Poster Grid Size Control: Small / Medium (default 2-col mobile) / Large
  const { gridSize, setGridSize, gridClasses } = usePosterGridSize();

  // 2. Separate "New Movies" (নতুন মুভি) section from Firebase
  const newMovies = useMemo(() => {
    const list = visibleMovies.filter((m) => {
      const cat = (m.category || '').toLowerCase();
      const genres = (m.genres || []).map((g) => g.toLowerCase());
      return (
        cat.includes('new') ||
        cat.includes('নতুন') ||
        genres.includes('new') ||
        m.releaseYear >= 2025 ||
        m.isTrending ||
        m.isFeatured
      );
    });
    return list.length > 0 ? list : visibleMovies.slice(0, 6);
  }, [visibleMovies]);

  // 3. Separate "Latest Releases" (লেটেস্ট রিলিজ) section
  const latestReleases = useMemo(() => {
    return visibleMovies;
  }, [visibleMovies]);

  const isToxicTitle = currentHero?.title?.toLowerCase().includes('toxic');

  return (
    <div className="space-y-8 pb-20 pt-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Featured Hero Spotlight Card (Dynamically driven by Firebase) */}
      {currentHero && (
        <section className="relative">
          <div
            onClick={() => onOpenDetails(currentHero)}
            className="relative w-full rounded-3xl border-2 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.25)] overflow-hidden bg-zinc-950 aspect-[16/10] sm:aspect-[21/9] max-h-[460px] cursor-pointer group transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
          >
            {/* Dynamic Backdrop Image from Firebase */}
            <img
              src={
                currentHero.backdropUrl ||
                currentHero.posterUrl ||
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80'
              }
              alt={`${currentHero.title}${currentHero.releaseYear ? ` (${currentHero.releaseYear})` : ''} – CineBox4u Featured Movie`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  currentHero.posterUrl ||
                  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 contrast-110"
            />

            {/* Vignette & Contrast Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent" />

            {/* Center/Left stylized title overlay if title is Toxic */}
            {isToxicTitle && (
              <div className="absolute left-5 sm:left-10 top-1/3 -translate-y-1/2 pointer-events-none select-none max-w-[280px] sm:max-w-md">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-widest text-zinc-300 font-serif opacity-80 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] uppercase">
                  TOXIC
                </h1>
                <p className="text-[10px] sm:text-xs tracking-[0.25em] text-zinc-400 font-bold uppercase mt-0.5">
                  A Fairy Tale for Grown-ups
                </p>
              </div>
            )}

            {/* Top-Right Badges */}
            <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none z-10">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-zinc-700/60 shadow-lg">
                FEATURED
              </span>
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-zinc-100 text-[10px] sm:text-xs font-semibold border border-zinc-700/60 shadow-lg">
                {currentHero.category || 'Hindi Dubbed Movies'}
              </span>
            </div>

            {/* Bottom-Left Details & Action Buttons */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 space-y-2.5 max-w-xl">
              <div>
                {isToxicTitle ? (
                  <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {currentHero.title}
                  </h2>
                ) : (
                  <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {currentHero.title}
                  </h1>
                )}
                <div className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm font-medium mt-1">
                  <span className="flex items-center gap-1.5 text-zinc-200">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentHero.releaseDate || currentHero.releaseYear}</span>
                  </span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">
                    {currentHero.videoQuality || currentHero.badgeQuality || '4K UHD'}
                  </span>
                  {currentHero.duration && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-300">{currentHero.duration}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(currentHero);
                  }}
                  className="px-4 sm:px-6 py-2 rounded-xl bg-zinc-950/85 hover:bg-amber-500 text-white hover:text-black border border-amber-500/70 hover:border-amber-400 font-black text-xs sm:text-sm flex items-center gap-2 transition duration-200 shadow-xl cursor-pointer group/btn"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-amber-400 group-hover/btn:text-black" />
                  <span>Watch Now</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(currentHero);
                  }}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড (7 Quality)</span>
                </button>
              </div>
            </div>

            {/* Carousel navigation controls if multiple featured items */}
            {featuredMovies.length > 1 && (
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHeroIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
                  }}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Previous Featured"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {featuredMovies.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHeroIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeHeroIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHeroIndex((prev) => (prev + 1) % featuredMovies.length);
                  }}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Next Featured"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3-Mode Movie Grid Size Control (Small / Medium / Large) */}
      <PosterGridControl gridSize={gridSize} onChange={setGridSize} />

      {/* 2. Separate "New Movies" Section (নতুন মুভি) from Firebase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>New Movies</span>
                <span className="text-xs sm:text-sm font-semibold text-amber-400">(নতুন মুভি)</span>
              </h2>
              <p className="text-[11px] text-zinc-400">সদ্য যুক্ত হওয়া নতুন সিনেমা সমূহ</p>
            </div>
          </div>

          <a
            href="/movies"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                onNavigateTab('movies');
              }
            }}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
          >
            <span>সব দেখুন ({newMovies.length})</span>
            <span>→</span>
          </a>
        </div>

        {/* Dynamic responsive grid */}
        <div className={gridClasses}>
          {newMovies.map((item, idx) => (
            <MovieCard
              key={item.id}
              item={item}
              gridSize={gridSize}
              priority={idx < 6}
              isFavorite={favorites.includes(item.id)}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      {/* 3. Separate "Latest Releases" Section (লেটেস্ট রিলিজ) from Firebase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-sm">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Latest Releases</span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-400">(লেটেস্ট রিলিজ)</span>
              </h2>
              <p className="text-[11px] text-zinc-400">সকল মুভি ও রিলিজ কালেকশন</p>
            </div>
          </div>

          <a
            href="/latest"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                onNavigateTab('latest');
              }
            }}
            className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer flex items-center gap-1"
          >
            <span>View All ({latestReleases.length})</span>
            <span>→</span>
          </a>
        </div>

        {/* Dynamic responsive grid */}
        <div className={gridClasses}>
          {latestReleases.map((item) => (
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
      </section>

      {/* 4. Separate Web Series & Dramas Section if series exist in Firebase */}
      {visibleSeries && visibleSeries.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Web Series & Dramas</span>
                  <span className="text-xs sm:text-sm font-semibold text-blue-400">(ওয়েব সিরিজ)</span>
                </h2>
                <p className="text-[11px] text-zinc-400">জনপ্রিয় ড্রামা ও এপিসোড সমূহ</p>
              </div>
            </div>

            <a
              href="/series"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  onNavigateTab('series');
                }
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              <span>সব সিরিজ ({visibleSeries.length})</span>
              <span>→</span>
            </a>
          </div>

          <div className={gridClasses}>
            {visibleSeries.map((item) => (
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
        </section>
      )}
    </div>
  );
};
