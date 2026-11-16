import React from 'react';
import { Movie, Series, Episode } from '../types';
import { MovieDetailsView } from '../components/MovieDetailsView';

interface WatchPageProps {
  media: Movie | Series;
  initialEpisode?: Episode;
  episodes?: Episode[];
  isFavorite: boolean;
  onToggleFavorite: (item: Movie | Series) => void;
  onBack: () => void;
  onPlaySimilar: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  allMovies: Movie[];
  allSeries: Series[];
  onProgressUpdate?: (progressSeconds: number, totalSeconds: number, completed: boolean) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  media,
  isFavorite,
  onToggleFavorite,
  onBack,
  onOpenDetails,
}) => {
  return (
    <MovieDetailsView
      media={media}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onBackToHome={onBack}
      onClose={onBack}
    />
  );
};
