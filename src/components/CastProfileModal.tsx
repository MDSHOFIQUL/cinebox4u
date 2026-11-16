import React from 'react';
import { X, Download, Star, Film, Award, Clapperboard, ExternalLink } from 'lucide-react';
import { Movie, Series, Episode } from '../types';

interface CastProfileModalProps {
  personName: string;
  role: 'actor' | 'director';
  movies: Movie[];
  series: Series[];
  onClose: () => void;
  onPlay?: (item: Movie | Series, episode?: Episode) => void;
  onOpenDetails: (item: Movie | Series) => void;
}

// Curated biographies and avatars for popular directors and actors
const PERSON_DATA: Record<string, { bio: string; avatar: string; birthYear?: number; nationality?: string }> = {
  'Christopher Nolan': {
    bio: 'Renowned British-American filmmaker known for his nonlinear storytelling, practical visual effects, and grand cinematic scale.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    birthYear: 1970,
    nationality: 'British-American',
  },
  'Cillian Murphy': {
    bio: 'Acclaimed Irish actor celebrated for his intense, chameleonic performances in psychological dramas, historical epics, and crime sagas.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    birthYear: 1976,
    nationality: 'Irish',
  },
  'Leonardo DiCaprio': {
    bio: 'Academy Award-winning actor and environmentalist celebrated for biopics, psychological thrillers, and blockbuster period epics.',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    birthYear: 1974,
    nationality: 'American',
  },
  'Christian Bale': {
    bio: 'Dedicated method actor famed for extreme physical transformations and iconic portrayals in major superhero and auteur films.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    birthYear: 1974,
    nationality: 'British',
  },
  'Robert Downey Jr.': {
    bio: 'Golden Globe and BAFTA-winning actor known for charisma, rapid-fire wit, and portraying Tony Stark in the MCU.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    birthYear: 1965,
    nationality: 'American',
  },
  'Chanchal Chowdhury': {
    bio: 'Legendary Bangladeshi film and stage actor known for groundbreaking performances in dramas, psychological mysteries, and acclaimed OTT series.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    birthYear: 1974,
    nationality: 'Bangladeshi',
  },
};

export const CastProfileModal: React.FC<CastProfileModalProps> = ({
  personName,
  role,
  movies,
  series,
  onClose,
  onPlay,
  onOpenDetails,
}) => {
  const meta = PERSON_DATA[personName] || {
    bio: `Renowned ${role === 'director' ? 'director and visionary' : 'actor and performing artist'} contributing notable cinematic works streaming on CineBox4u.`,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    nationality: 'International',
  };

  // Find all titles in CineBox4u where this person is in cast or is the director
  const filmographyMovies = movies.filter((m) => {
    if (role === 'director') {
      return m.director?.toLowerCase().includes(personName.toLowerCase());
    }
    return m.cast?.some((c) => c.toLowerCase().includes(personName.toLowerCase()));
  });

  const filmographySeries = series.filter((s) => {
    if (role === 'director') {
      return s.director?.toLowerCase().includes(personName.toLowerCase());
    }
    return s.cast?.some((c) => c.toLowerCase().includes(personName.toLowerCase()));
  });

  const allTitles = [...filmographyMovies, ...filmographySeries];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0e1017] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl text-zinc-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-red-600 text-white transition backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-zinc-900 to-[#0e1017] border-b border-zinc-800/80">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-xl shrink-0">
              <img
                src={meta.avatar}
                alt={personName}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white shadow">
                {role}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                  {meta.nationality}
                </span>
                {meta.birthYear && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-800/80">
                    Born {meta.birthYear}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-red-600/20 text-red-400 border border-red-500/30">
                  {allTitles.length} Titles on CineBox4u
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">{personName}</h2>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed max-w-xl">{meta.bio}</p>
            </div>
          </div>
        </div>

        {/* Filmography Section */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Filmography on CineBox4u ({allTitles.length})
              </h3>
            </div>
            <span className="text-xs text-zinc-400">Stream in HD/4K</span>
          </div>

          {allTitles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {allTitles.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-red-500/50 flex items-center justify-between gap-3 transition group"
                >
                  <div
                    onClick={() => {
                      onOpenDetails(item);
                      onClose();
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="w-12 h-16 rounded-xl overflow-hidden bg-black shrink-0 relative">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                        <span className="uppercase font-semibold">{item.type}</span>
                        <span>•</span>
                        <span>{item.releaseYear}</span>
                        <span>•</span>
                        <span className="flex items-center text-amber-400 font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
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
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-bold shrink-0 shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    title="ডাউনলোড ও বিস্তারিত"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>ডাউনলোড</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800">
              No additional titles currently tagged for this artist in our catalog.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
