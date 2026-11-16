import React, { useEffect } from 'react';
import { Movie, Series, Episode } from '../types';
import { MovieDetailsView } from './MovieDetailsView';

interface MovieDetailsModalProps {
  item: Movie | Series;
  episodes?: Episode[];
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (item: Movie | Series) => void;
  onPlay?: (item: Movie | Series) => void;
  onOpenPerson?: (name: string, role: 'actor' | 'director') => void;
  onSelectCategory?: (categorySlug: string) => void;
  onDownloadStarted?: (item: Movie | Series, quality: string) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  item,
  episodes = [],
  isFavorite,
  onClose,
  onToggleFavorite,
  onPlay,
  onOpenPerson,
  onSelectCategory,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md animate-fadeIn">
      <MovieDetailsView
        media={item}
        episodes={episodes}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onBackToHome={onClose}
        onClose={onClose}
        onPlay={onPlay}
        onOpenPerson={onOpenPerson}
        onSelectCategory={onSelectCategory}
        isModal={true}
      />
    </div>
  );
};
