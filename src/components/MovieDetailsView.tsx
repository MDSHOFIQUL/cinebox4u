import React, { useState, useEffect } from 'react';
import {
  Film,
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Globe,
  FileText,
  Camera,
  Download,
  Bookmark,
  Share2,
  X,
  ChevronRight,
  Maximize2,
  Play,
  Video,
  Users,
  Clapperboard,
  Layers,
} from 'lucide-react';
import { Movie, Series, Episode } from '../types';
import { ScreenshotLightbox } from './ScreenshotLightbox';
import { MovieReactionsSection } from './MovieReactionsSection';
import { MovieDownloadLinksSection } from './MovieDownloadLinksSection';
import { MovieSeasonsSection } from './MovieSeasonsSection';
import { MovieCommentsSection } from './MovieCommentsSection';
import { ShareModal } from './ShareModal';

interface MovieDetailsViewProps {
  media: Movie | Series;
  episodes?: Episode[];
  isFavorite: boolean;
  onToggleFavorite: (media: Movie | Series) => void;
  onBackToHome: () => void;
  onClose?: () => void;
  onPlay?: (media: Movie | Series) => void;
  onOpenPerson?: (name: string, role: 'actor' | 'director') => void;
  onSelectCategory?: (categorySlug: string) => void;
  isModal?: boolean;
}

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0`;
  }
  return null;
}

export const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({
  media,
  episodes = [],
  isFavorite,
  onToggleFavorite,
  onBackToHome,
  onClose,
  onPlay,
  onOpenPerson,
  onSelectCategory,
  isModal = false,
}) => {
  const isMovie = media.type === 'movie';
  const movie = isMovie ? (media as Movie) : null;
  const series = !isMovie ? (media as Series) : null;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedScreenshotIdx, setSelectedScreenshotIdx] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  // Reset image error states whenever navigated to a different movie
  useEffect(() => {
    setBackdropError(false);
    setPosterError(false);
    setLightboxOpen(false);
    setSelectedScreenshotIdx(0);
  }, [media.id]);

  // Real data extraction (NO fake/demo fallbacks)
  const releaseDateText = movie?.releaseDate || series?.releaseDate || (media.releaseYear ? String(media.releaseYear) : '');
  const rawImdb = movie?.imdbRating ?? series?.imdbRating ?? media.rating;
  const imdbScore = typeof rawImdb === 'number' && rawImdb > 0 ? rawImdb : null;
  const durationText = isMovie
    ? movie?.duration || (movie?.durationMinutes ? `${movie.durationMinutes} min` : '')
    : series?.seasonsCount || series?.totalEpisodes
    ? `${series.seasonsCount || 1} Season${(series.seasonsCount || 1) > 1 ? 's' : ''}${
        series.totalEpisodes ? ` · ${series.totalEpisodes} Episodes` : ''
      }`
    : '';

  const genresList = (media.genres || []).filter(Boolean);
  const castList = (media.cast || []).filter(Boolean);
  const directorText = (media.director || '').trim();
  const screenshots = (media.screenshots || []).filter(Boolean);

  // Real trailer only if present
  const primaryTrailerUrl =
    media.trailers?.find((t) => t?.url?.trim())?.url?.trim() ||
    ((media as unknown as { trailerUrl?: string }).trailerUrl || '').trim();
  const youtubeTrailerEmbed = primaryTrailerUrl ? getYoutubeEmbedUrl(primaryTrailerUrl) : null;

  const qualityLabel = movie?.badgeQuality || series?.badgeQuality || movie?.videoQuality || '';
  const hasStreamableVideo = Boolean(
    media.videoServers?.some((s) => s.streamUrl && s.status !== 'broken' && !['gdrive', 'mega'].includes(s.serverType)) ||
      movie?.directDownloadUrl
  );

  // Seasons / Parts / Episodes (only present when the admin added them)
  const hasSeasons = Boolean(movie?.seasons?.some((s) => s?.episodes?.length));
  const hasMainLinks = Boolean(
    movie?.directDownloadUrl ||
      movie?.megaDownloadUrl ||
      movie?.gdriveDownloadUrl ||
      movie?.downloadOptions?.length ||
      movie?.videoServers?.length
  );

  const handleOpenScreenshot = (idx: number) => {
    setSelectedScreenshotIdx(idx);
    setLightboxOpen(true);
  };

  const scrollToDownloadSection = () => {
    const el =
      document.getElementById('download-links-section') || document.getElementById('seasons-episodes-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const heroBgSrc = !backdropError && (media.backdropUrl || media.posterUrl)
    ? media.backdropUrl || media.posterUrl
    : '';

  return (
    <div
      className={`min-h-screen bg-[#07080b] text-[#f3f4f6] selection:bg-red-600 selection:text-white ${
        isModal ? 'pt-4' : 'pt-20 sm:pt-22'
      } pb-24`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Back Navigation & Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101117] border border-zinc-800/90 rounded-2xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose || onBackToHome}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-white flex items-center gap-2 transition cursor-pointer touch-manipulation shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>ফিরে যান (Back)</span>
            </button>

            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 truncate">
              <button
                type="button"
                onClick={onBackToHome}
                className="hover:text-amber-400 transition cursor-pointer shrink-0"
              >
                CineBox4u
              </button>
              {media.category && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <button
                    type="button"
                    onClick={() => onSelectCategory && onSelectCategory(media.category)}
                    className="hover:text-white transition truncate cursor-pointer"
                  >
                    {media.category}
                  </button>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span className="text-zinc-200 font-semibold truncate max-w-[260px]">
                {media.title}
              </span>
            </nav>
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-red-600/20 border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* HERO SECTION: Backdrop + Vertical Poster + Core Metadata + Primary CTAs  */}
        {/* ========================================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-[#101117] shadow-2xl">
          {/* Atmospheric Backdrop Layer */}
          {heroBgSrc && (
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={heroBgSrc}
                alt={`${media.title} Backdrop`}
                referrerPolicy="no-referrer"
                onError={() => setBackdropError(true)}
                className="w-full h-full object-cover opacity-25 blur-[2px] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/85 to-[#0b0c10]/70" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/80 to-transparent" />
            </div>
          )}

          <div className="relative z-10 p-5 sm:p-8 flex flex-col md:flex-row gap-6 lg:gap-8 items-center md:items-start">
            {/* Movie Poster (2:3) */}
            <div className="w-56 sm:w-68 md:w-72 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-700/80 shadow-2xl">
              {!posterError && media.posterUrl ? (
                <img
                  src={media.posterUrl}
                  alt={`${media.title} Poster`}
                  referrerPolicy="no-referrer"
                  onError={() => setPosterError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500">
                  <Film className="w-10 h-10 mb-2 text-amber-500/70" />
                  <span className="text-sm font-bold text-zinc-300">{media.title}</span>
                </div>
              )}
            </div>

            {/* Movie Title, Info & Action Buttons */}
            <div className="flex-1 w-full space-y-5 text-left">
              <div className="space-y-2">
                {media.category && (
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {media.category}
                  </p>
                )}

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  {media.title}
                </h1>

                {media.originalTitle && media.originalTitle !== media.title && (
                  <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                    {media.originalTitle}
                  </p>
                )}
              </div>

              {/* Metadata Row (Only real fields) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-zinc-300 tabular-nums">
                {imdbScore !== null && (
                  <span className="inline-flex items-center gap-1.5 font-black text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>IMDb {imdbScore.toFixed(1)} / 10</span>
                  </span>
                )}

                {releaseDateText && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>{releaseDateText}</span>
                  </span>
                )}

                {durationText && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{durationText}</span>
                  </span>
                )}

                {media.language && (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-zinc-400" />
                    <span>{media.language}</span>
                  </span>
                )}

                {qualityLabel && (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-black uppercase">
                    {qualityLabel}
                  </span>
                )}
              </div>

              {/* Genres */}
              {genresList.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                  <Layers className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {genresList.map((genre, idx) => (
                    <React.Fragment key={genre}>
                      {idx > 0 && <span className="text-zinc-600" aria-hidden="true">·</span>}
                      <span className="font-medium text-zinc-200">{genre}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Movie Description */}
              {media.description && (
                <div className="space-y-1.5 pt-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>কাহিনী সংক্ষেপ (Description)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
                    {media.description}
                  </p>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={scrollToDownloadSection}
                  className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-950/60 transition-transform duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer touch-manipulation"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>ডাউনলোড করুন (Download)</span>
                </button>

                {onPlay && hasStreamableVideo && (
                  <button
                    type="button"
                    onClick={() => onPlay(media)}
                    className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition cursor-pointer touch-manipulation"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>অনলাইনে দেখুন (Watch Now)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onToggleFavorite(media)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer touch-manipulation ${
                    isFavorite
                      ? 'bg-red-600/20 border-red-500 text-red-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'সেভ করা আছে' : 'ওয়াচলিস্ট'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer touch-manipulation"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>শেয়ার</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* MOVIE INFORMATION & CAST/CREW DETAILS (Strictly Real Data)               */}
        {/* ========================================================================= */}
        <section className="bg-[#101117] border border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Film className="w-5 h-5 text-red-500" />
              <span>মুভির বিস্তারিত তথ্য (Movie Details)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
              <span className="font-semibold text-zinc-400 shrink-0">মুভির নাম:</span>
              <span className="font-bold text-white text-right">{media.title}</span>
            </div>

            {releaseDateText && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-400 shrink-0">রিলিজের তারিখ:</span>
                <span className="font-bold text-zinc-200 text-right">{releaseDateText}</span>
              </div>
            )}

            {durationText && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-400 shrink-0">সময়সীমা (Duration):</span>
                <span className="font-bold text-zinc-200 text-right">{durationText}</span>
              </div>
            )}

            {media.language && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-400 shrink-0">ভাষা (Language):</span>
                <span className="font-bold text-red-400 text-right">{media.language}</span>
              </div>
            )}

            {(media.category || genresList.length > 0) && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-400 shrink-0">ক্যাটাগরি / জেনার:</span>
                <span className="font-bold text-zinc-200 text-right">
                  {[media.category, ...genresList].filter(Boolean).join(' · ')}
                </span>
              </div>
            )}

            {imdbScore !== null && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-400 shrink-0">IMDb রেটিং:</span>
                <span className="font-black text-amber-400 text-right tabular-nums">
                  ★ {imdbScore.toFixed(1)} / 10
                </span>
              </div>
            )}

            {movie?.audioInfo && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-400 shrink-0">অডিও ট্র্যাক:</span>
                <span className="font-bold text-amber-300 text-right">{movie.audioInfo}</span>
              </div>
            )}

            {movie?.subtitleInfo && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-400 shrink-0">সাবটাইটেল:</span>
                <span className="font-bold text-emerald-400 text-right">{movie.subtitleInfo}</span>
              </div>
            )}
          </div>

          {/* Cast & Crew Block (Only real Director / Cast data) */}
          {(directorText || castList.length > 0) && (
            <div className="pt-3 border-t border-zinc-800/80 space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>কাস্ট ও ক্রু (Cast & Crew)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                {directorText && (
                  <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
                    <span className="font-semibold text-zinc-400 flex items-center gap-1.5 shrink-0">
                      <Clapperboard className="w-3.5 h-3.5 text-red-400" />
                      <span>পরিচালক (Director):</span>
                    </span>
                    {onOpenPerson ? (
                      <button
                        type="button"
                        onClick={() => onOpenPerson(directorText, 'director')}
                        className="font-bold text-amber-400 hover:underline text-right cursor-pointer"
                      >
                        {directorText}
                      </button>
                    ) : (
                      <span className="font-bold text-white text-right">{directorText}</span>
                    )}
                  </div>
                )}

                {castList.length > 0 && (
                  <div
                    className={`p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col gap-2 ${
                      directorText ? '' : 'md:col-span-2'
                    }`}
                  >
                    <span className="font-semibold text-zinc-400">অভিনয় শিল্পী (Cast):</span>
                    <div className="flex flex-wrap gap-2">
                      {castList.map((actor) =>
                        onOpenPerson ? (
                          <button
                            key={actor}
                            type="button"
                            onClick={() => onOpenPerson(actor, 'actor')}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:text-amber-400 transition cursor-pointer"
                          >
                            {actor}
                          </button>
                        ) : (
                          <span
                            key={actor}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200"
                          >
                            {actor}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* OFFICIAL TRAILER (Shown ONLY if a real trailer URL exists)                */}
        {/* ========================================================================= */}
        {primaryTrailerUrl && (
          <section className="bg-[#101117] border border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Official Trailer
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {media.title} — অফিসিয়াল ট্রেলার প্রিভিউ
                  </p>
                </div>
              </div>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
              {youtubeTrailerEmbed ? (
                <iframe
                  src={youtubeTrailerEmbed}
                  title={`${media.title} Official Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  src={primaryTrailerUrl}
                  controls
                  poster={media.backdropUrl || media.posterUrl}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SCREENSHOTS GALLERY (Shown ONLY if real screenshots exist)               */}
        {/* ========================================================================= */}
        {screenshots.length > 0 && (
          <section className="bg-[#101117] border border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Screenshots
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    ছবিতে ক্লিক করে বড় করে দেখুন
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-400 tabular-nums">
                {screenshots.length} Stills
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {screenshots.map((shot, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenScreenshot(idx)}
                  className="group relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 hover:border-amber-500/60 transition-all duration-200 cursor-pointer shadow-lg"
                >
                  <img
                    src={shot}
                    alt={`${media.title} Screenshot ${idx + 1}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-black flex items-center gap-1.5 shadow-xl">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>বড় করে দেখুন</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* DOWNLOAD BUTTON & AVAILABLE SERVERS (Strictly Real Admin Links)          */}
        {/* ========================================================================= */}
        {hasSeasons && movie && <MovieSeasonsSection movie={movie} />}
        {!(hasSeasons && !hasMainLinks) && <MovieDownloadLinksSection media={media} episodes={episodes} />}

        {/* Reactions & Comments */}
        <MovieReactionsSection
          mediaId={media.id}
          mediaTitle={media.title}
          initialReactions={movie?.reactions}
        />

        <MovieCommentsSection mediaId={media.id} mediaTitle={media.title} />
      </div>

      {/* Screenshot Lightbox */}
      {screenshots.length > 0 && (
        <ScreenshotLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          screenshots={screenshots}
          currentIndex={selectedScreenshotIdx}
          onSelectIndex={setSelectedScreenshotIdx}
          movieTitle={media.title}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={media.title}
        category={media.category}
        posterUrl={media.posterUrl}
      />
    </div>
  );
};
