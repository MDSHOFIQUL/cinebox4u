import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, Download } from 'lucide-react';

interface ScreenshotLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  screenshots: string[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  movieTitle: string;
}

export const ScreenshotLightbox: React.FC<ScreenshotLightboxProps> = ({
  isOpen,
  onClose,
  screenshots,
  currentIndex,
  onSelectIndex,
  movieTitle,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onSelectIndex((currentIndex - 1 + screenshots.length) % screenshots.length);
      }
      if (e.key === 'ArrowRight') {
        onSelectIndex((currentIndex + 1) % screenshots.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, screenshots.length, onClose, onSelectIndex]);

  if (!isOpen || screenshots.length === 0) return null;

  const currentImage = screenshots[currentIndex] || screenshots[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex - 1 + screenshots.length) % screenshots.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex + 1) % screenshots.length);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn select-none"
    >
      {/* Top Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between z-10 bg-zinc-950/80 border border-zinc-800/80 px-4 py-2.5 rounded-2xl max-w-4xl w-full mx-auto backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            SCREENSHOT {currentIndex + 1} / {screenshots.length}
          </span>
          <span className="text-xs font-semibold text-zinc-300 truncate max-w-xs sm:max-w-md hidden sm:inline">
            {movieTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={currentImage}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
            title="Open Full Resolution in New Tab"
          >
            <Maximize2 className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition cursor-pointer border border-red-500/30"
            title="Close Lightbox (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
      >
        <img
          src={currentImage}
          alt={`${movieTitle} Screenshot ${currentIndex + 1}`}
          className="max-h-[75vh] max-w-[95vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-zinc-800 transition-all duration-300"
        />

        {/* Previous Button */}
        {screenshots.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-red-600 text-white transition backdrop-blur-md border border-white/20 cursor-pointer shadow-xl hover:scale-110"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {screenshots.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-red-600 text-white transition backdrop-blur-md border border-white/20 cursor-pointer shadow-xl hover:scale-110"
            aria-label="Next screenshot"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnails Row */}
      {screenshots.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 max-w-2xl mx-auto scrollbar-none z-10"
        >
          {screenshots.map((shot, idx) => (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                  : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
              }`}
            >
              <img
                src={shot}
                alt={`Thumbnail ${idx + 1}`}
                className="w-16 h-10 sm:w-20 sm:h-12 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
