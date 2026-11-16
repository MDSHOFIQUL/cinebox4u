import { useState, useEffect, useCallback } from 'react';

export type PosterGridSize = 'small' | 'medium' | 'large';

const STORAGE_KEY = 'cinebox_poster_grid_size';
const SYNC_EVENT = 'cinebox-poster-grid-size-change';

export const POSTER_GRID_CLASSES: Record<PosterGridSize, string> = {
  small:
    'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 transition-all duration-300',
  medium:
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 transition-all duration-300',
  large:
    'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 transition-all duration-300',
};

function readInitialGridSize(): PosterGridSize {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'small' || saved === 'medium' || saved === 'large') {
      return saved;
    }
    if (saved === 'compact') {
      return 'medium';
    }
  } catch {
    // ignore storage errors
  }
  return 'medium';
}

export function usePosterGridSize() {
  const [gridSize, setGridSizeState] = useState<PosterGridSize>(readInitialGridSize);

  const setGridSize = useCallback((size: PosterGridSize) => {
    setGridSizeState(size);
    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch {
      // ignore storage errors
    }
    window.dispatchEvent(new CustomEvent<PosterGridSize>(SYNC_EVENT, { detail: size }));
  }, []);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<PosterGridSize>;
      if (custom.detail === 'small' || custom.detail === 'medium' || custom.detail === 'large') {
        setGridSizeState(custom.detail);
      }
    };
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, []);

  return {
    gridSize,
    setGridSize,
    gridClasses: POSTER_GRID_CLASSES[gridSize],
  };
}
