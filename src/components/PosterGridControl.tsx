import React from 'react';
import { Grid3X3, Grid2X2, LayoutGrid } from 'lucide-react';
import { PosterGridSize } from '../hooks/usePosterGridSize';

interface PosterGridControlProps {
  gridSize: PosterGridSize;
  onChange: (size: PosterGridSize) => void;
  label?: string;
}

export const PosterGridControl: React.FC<PosterGridControlProps> = ({
  gridSize,
  onChange,
  label = 'পোস্টার সাইজ',
}) => {
  const options: { id: PosterGridSize; title: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'small',
      title: 'Small View (বেশি মুভি, ছোট পোস্টার)',
      shortLabel: 'Small',
      icon: <Grid3X3 className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'medium',
      title: 'Medium View (ডিফল্ট ২-কলাম ভিউ)',
      shortLabel: 'Medium',
      icon: <Grid2X2 className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'large',
      title: 'Large View (বড় পোস্টার ভিউ)',
      shortLabel: 'Large',
      icon: <LayoutGrid className="w-3.5 h-3.5 shrink-0" />,
    },
  ];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex flex-wrap items-center justify-between gap-2 bg-[#101117] border border-zinc-800/90 rounded-2xl px-3.5 py-2.5 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-zinc-200 whitespace-nowrap">{label}:</span>
        <span className="text-[11px] text-zinc-400 hidden sm:inline">
          Small · Medium · Large
        </span>
      </div>

      <div
        role="group"
        aria-label="Movie Poster Grid Size"
        className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800"
      >
        {options.map((opt) => {
          const isActive = gridSize === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.id);
              }}
              aria-pressed={isActive}
              title={opt.title}
              className={`min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-150 cursor-pointer touch-manipulation whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {opt.icon}
              <span>{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
