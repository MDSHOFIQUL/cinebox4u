import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Movie, Series, FavoriteItem, WatchHistoryItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import {
  User as UserIcon,
  Bookmark,
  Clock,
  Download,
  Trash2,
  Shield,
  CheckCircle,
  Film,
  Sparkles,
} from 'lucide-react';

interface ProfilePageProps {
  initialTab?: 'favorites' | 'history';
  movies: Movie[];
  series: Series[];
  favorites: FavoriteItem[];
  watchHistory: WatchHistoryItem[];
  onPlay: (item: Movie | Series) => void;
  onOpenDetails: (item: Movie | Series) => void;
  onRemoveFavorite: (item: Movie | Series) => void;
  onRemoveHistory: (historyId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  initialTab = 'favorites',
  movies,
  series,
  favorites,
  watchHistory,
  onPlay,
  onOpenDetails,
  onRemoveFavorite,
  onRemoveHistory,
  onNavigateTab,
}) => {
  const { user, profile, isAdmin, isEditor, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>(initialTab);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 pb-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Sign In to CineBox4u</h2>
        <p className="text-xs text-zinc-400">
          Sign in to save your favorite movies, sync watch progress across devices, and manage playlists.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/60"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  // Favorite items mapped to full Movie or Series
  const favoriteMediaList = favorites
    .map((fav) => {
      const match =
        fav.mediaType === 'movie'
          ? movies.find((m) => m.id === fav.mediaId)
          : series.find((s) => s.id === fav.mediaId);
      return match;
    })
    .filter(Boolean) as (Movie | Series)[];

  // Total watched hours approx
  const totalWatchedSeconds = watchHistory.reduce((acc, curr) => acc + (curr.progressSeconds || 0), 0);
  const totalWatchedHours = (totalWatchedSeconds / 3600).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={profile?.displayName || 'User'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-red-600 shadow-xl"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-2xl font-black text-white shadow-xl">
              {((profile?.displayName || user.email || 'U')[0] || 'U').toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {profile?.displayName || user.displayName || 'CineBox Viewer'}
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                {profile?.role || 'User'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* User Quick Stats */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-center">
            <span className="text-lg font-black text-white">{favorites.length}</span>
            <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Watchlist</span>
          </div>
          <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-center">
            <span className="text-lg font-black text-white">{watchHistory.length}</span>
            <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Watched</span>
          </div>
          <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-center">
            <span className="text-lg font-black text-red-500">{totalWatchedHours}h</span>
            <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Stream Time</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'favorites'
              ? 'bg-red-600 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>My Watchlist ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'history'
              ? 'bg-red-600 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Watch History ({watchHistory.length})</span>
        </button>

        {(isAdmin || isEditor) && (
          <button
            onClick={() => onNavigateTab('admin')}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600 hover:text-white transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'favorites' ? (
        <div>
          {favoriteMediaList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favoriteMediaList.map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  isFavorite={true}
                  onPlay={onPlay}
                  onOpenDetails={onOpenDetails}
                  onToggleFavorite={onRemoveFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-3">
              <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">Your watchlist is empty.</p>
              <p className="text-xs text-zinc-500">
                Click the bookmark icon on any movie or series to save it for later.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {watchHistory.length > 0 ? (
            watchHistory.map((item) => {
              const percent = Math.min(100, Math.round((item.progressSeconds / (item.totalSeconds || 1)) * 100));
              const matched =
                movies.find((m) => m.id === item.mediaId) || series.find((s) => s.id === item.mediaId);

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between gap-4 transition hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-12 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-zinc-400">
                        {percent}% finished • Last played{' '}
                        {new Date(item.lastWatchedAt).toLocaleDateString()}
                      </p>
                      <div className="w-36 h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-red-600" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {matched && (
                      <button
                        onClick={() => onOpenDetails(matched)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ডাউনলোড করুন</span>
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveHistory(item.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition"
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-3">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">No watch history recorded yet.</p>
              <p className="text-xs text-zinc-500">
                Stream any movie or series and your playback resume point will automatically sync here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
