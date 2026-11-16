import React from 'react';
import { X, Download, Star, Film, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { Movie, Series, Episode } from '../types';

export interface FranchiseCollection {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  backdropUrl: string;
  titleIds: string[];
}

export const FRANCHISE_COLLECTIONS: FranchiseCollection[] = [
  {
    id: 'nolan-cinema',
    name: 'Christopher Nolan: Mind-Bending Realities',
    subtitle: 'The Non-Linear Sci-Fi Masterclass',
    description:
      'Immerse yourself in high-concept physics, temporal inversions, subconscious heists, and historical epics by auteur director Christopher Nolan.',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    titleIds: ['movie-1', 'movie-2', 'movie-7', 'movie-8'],
  },
  {
    id: 'cyberpunk-sci-fi',
    name: 'Cyberpunk & Futuristic Sagas',
    subtitle: 'Neon Megacities & High-Octane Android Lore',
    description:
      'Explore synth-drenched neon dystopias, sentient android detectives, quantum espionage, and digital transcendence.',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80',
    titleIds: ['movie-3', 'movie-4', 'series-1'],
  },
  {
    id: 'bengali-thrillers',
    name: 'Bengali Crime & Psychological Spotlight',
    subtitle: 'Deep Human Mystery & Acclaimed Dramas',
    description:
      'Gripping narratives from Bengal featuring stellar acting, intricate courtroom battles, and spine-chilling suspense from Dhaka to Kolkata.',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    titleIds: ['movie-5', 'movie-6', 'series-2'],
  },
];

interface FranchiseModalProps {
  collection: FranchiseCollection;
  movies: Movie[];
  series: Series[];
  favorites: string[];
  onClose: () => void;
  onPlay?: (item: Movie | Series, episode?: Episode) => void;
  onOpenDetails: (item: Movie | Series) => void;
}

export const FranchiseModal: React.FC<FranchiseModalProps> = ({
  collection,
  movies,
  series,
  favorites,
  onClose,
  onPlay,
  onOpenDetails,
}) => {
  const allCatalog = [...movies, ...series];
  const franchiseItems = collection.titleIds
    .map((id) => allCatalog.find((c) => c.id === id))
    .filter((item): item is Movie | Series => item !== undefined);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0e1017] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl text-zinc-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-red-600 text-white transition backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black">
          <img
            src={collection.backdropUrl}
            alt={collection.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-[#0e1017]/50 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow">
                Curated Franchise
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800/80 text-zinc-300">
                {franchiseItems.length} Titles
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{collection.name}</h2>
            <p className="text-xs sm:text-sm text-red-400 font-semibold mt-0.5">{collection.subtitle}</p>
            <p className="text-xs text-zinc-300 mt-2 max-w-2xl line-clamp-2">{collection.description}</p>
          </div>
        </div>

        {/* Content Items */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Saga Order & Chronology
              </h3>
            </div>
            <span className="text-xs text-zinc-400">Stream in 4K Ultra HD</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {franchiseItems.map((item, index) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-red-500/50 flex items-center justify-between gap-4 transition group"
              >
                <div
                  onClick={() => {
                    onOpenDetails(item);
                    onClose();
                  }}
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                >
                  <span className="text-base font-black font-mono text-zinc-500 group-hover:text-red-500 w-6 text-center">
                    0{index + 1}
                  </span>
                  <div className="w-14 h-20 rounded-xl overflow-hidden bg-black shrink-0 relative shadow">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-400">
                      <span>{item.releaseYear}</span>
                      <span>•</span>
                      <span className="capitalize">{item.category}</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {item.rating?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onOpenDetails(item);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs flex items-center gap-2 shadow-lg transition shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>ডাউনলোড</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
