import React from 'react';
import { Movie, Series, Episode, Category, UserProfile, AdminLog } from '../../types';
import {
  Film,
  Tv,
  Layers,
  Users,
  Eye,
  FolderTree,
  PlusCircle,
  Server,
  ArrowUpRight,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  History as HistoryIcon,
  FileCode,
} from 'lucide-react';
import { AdminSection } from './AdminLayout';

interface AdminDashboardProps {
  movies: Movie[];
  series: Series[];
  episodes: Episode[];
  categories: Category[];
  users: UserProfile[];
  adminLogs: AdminLog[];
  onNavigateSection: (section: AdminSection) => void;
  onEditMovie: (movie: Movie) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  movies,
  series,
  episodes,
  categories,
  users,
  adminLogs,
  onNavigateSection,
  onEditMovie,
}) => {
  // Aggregate downloads
  const totalMovieDownloads = movies.reduce((acc, m) => acc + (m.downloadsCount || 0), 0);
  const totalSeriesViews = series.reduce((acc, s) => acc + (s.viewsCount || 0), 0);

  const statCards = [
    { label: 'Total Movies', value: movies.length, icon: Film, color: 'text-red-500', section: 'movies' as AdminSection },
    { label: 'Total Series', value: series.length, icon: Tv, color: 'text-blue-500', section: 'series' as AdminSection },
    { label: 'Total Episodes', value: episodes.length, icon: Layers, color: 'text-purple-500', section: 'episodes' as AdminSection },
    { label: 'Registered Users', value: users.length, icon: Users, color: 'text-emerald-500', section: 'users' as AdminSection },
    { label: 'Categories', value: categories.length, icon: FolderTree, color: 'text-amber-500', section: 'categories' as AdminSection },
    { label: 'Total MP4 Downloads', value: totalMovieDownloads.toLocaleString(), icon: Sparkles, color: 'text-amber-400', section: 'reports' as AdminSection },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="p-6 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400">
              Live Operations Online
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            CineBox4u Central Control
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time catalog metrics, multi-server playback status, and user management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateSection('add-movie')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Movie</span>
          </button>

          <button
            onClick={() => onNavigateSection('servers')}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-zinc-700/80 transition"
          >
            <Server className="w-4 h-4 text-red-500" />
            <span>Test Video Links</span>
          </button>

          <button
            onClick={() => onNavigateSection('html-file')}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600 hover:to-amber-600 border border-amber-500/40 text-amber-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <FileCode className="w-4 h-4" />
            <span>HTML ফাইল (Admin Only)</span>
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={() => onNavigateSection(card.section)}
              className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 hover:border-zinc-700 cursor-pointer transition hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Movies & Recent Admin Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Movies List */}
        <div className="lg:col-span-2 p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Movies Catalog ({movies.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateSection('movies')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              Manage All
            </button>
          </div>

          <div className="space-y-2">
            {movies.slice(0, 6).map((movie) => (
              <div
                key={movie.id}
                className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-10 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{movie.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                      <span>{movie.releaseYear}</span>
                      <span>•</span>
                      <span>{movie.category}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400">{movie.videoQuality}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">★ {movie.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      movie.isPublished
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {movie.isPublished ? 'Published' : 'Draft'}
                  </span>

                  <button
                    onClick={() => onEditMovie(movie)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg font-medium transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Admin Activity Logs */}
        <div className="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Audit Trail ({adminLogs.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateSection('logs')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              Full Log
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {adminLogs.length > 0 ? (
              adminLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-zinc-300 font-medium line-clamp-2 text-[11px]">{log.details}</p>
                  <p className="text-[10px] text-zinc-500 truncate">By {log.adminEmail}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-8">
                No activity records yet. Modifications are logged here automatically.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
