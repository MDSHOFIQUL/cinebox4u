import React, { useState, useEffect } from 'react';
import { Movie, Series } from '../types';
import { useLocale } from '../context/LocaleContext';
import { Calendar as CalendarIcon, Bell, BellRing, Download, Info, Sparkles, Filter } from 'lucide-react';

interface CalendarPageProps {
  movies: Movie[];
  series: Series[];
  onOpenDetails: (item: Movie | Series) => void;
  onPlay: (item: Movie | Series) => void;
}

interface CalendarEntry {
  id: string;
  item: Movie | Series;
  releaseDate: string; // ISO date string or formatted date
  title: string;
  type: 'movie' | 'series';
  posterUrl: string;
  backdropUrl?: string;
  genres: string[];
  rating: number;
  description: string;
  status: 'upcoming' | 'released';
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ movies, series, onOpenDetails, onPlay }) => {
  const { t } = useLocale();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series'>('all');
  const [reminders, setReminders] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cinebox4u_calendar_reminders') || '[]');
    } catch {
      return [];
    }
  });

  const toggleReminder = (id: string) => {
    let updated: string[];
    if (reminders.includes(id)) {
      updated = reminders.filter((r) => r !== id);
    } else {
      updated = [...reminders, id];
    }
    setReminders(updated);
    localStorage.setItem('cinebox4u_calendar_reminders', JSON.stringify(updated));
  };

  // Build calendar timeline entries
  const allEntries: CalendarEntry[] = [
    ...movies.map((m) => {
      // Create a deterministic upcoming or recent date based on releaseYear & id
      const dateStr = m.created_at || `${m.releaseYear || 2026}-03-15`;
      return {
        id: m.id,
        item: m,
        releaseDate: dateStr,
        title: m.title,
        type: 'movie' as const,
        posterUrl: m.posterUrl,
        backdropUrl: m.backdropUrl,
        genres: m.genres || [],
        rating: m.rating,
        description: m.description,
        status: (m.releaseYear || 2026) >= 2026 ? ('upcoming' as const) : ('released' as const),
      };
    }),
    ...series.map((s) => {
      const dateStr = s.created_at || `${s.releaseYear || 2026}-04-01`;
      return {
        id: s.id,
        item: s,
        releaseDate: dateStr,
        title: s.title,
        type: 'series' as const,
        posterUrl: s.posterUrl,
        backdropUrl: s.backdropUrl,
        genres: s.genres || [],
        rating: s.rating,
        description: s.description,
        status: (s.releaseYear || 2026) >= 2026 ? ('upcoming' as const) : ('released' as const),
      };
    }),
  ];

  const filteredEntries = allEntries
    .filter((e) => {
      if (filterType === 'all') return true;
      return e.type === filterType;
    })
    .sort((a, b) => (a.releaseDate > b.releaseDate ? -1 : 1));

  return (
    <div className="min-h-screen bg-[#07080b] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            CineBox4u Premiere Pipeline
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-red-500" />
            {t('nav_calendar')}
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl">
            Never miss a blockbuster premiere. Explore theatrical digital debuts, new series seasons, and upcoming Bengali & international drops.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800 self-start md:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              filterType === 'all' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Releases ({allEntries.length})
          </button>
          <button
            onClick={() => setFilterType('movie')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              filterType === 'movie' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setFilterType('series')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              filterType === 'series' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Series
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
        {filteredEntries.map((entry) => {
          const hasReminder = reminders.includes(entry.id);
          return (
            <div
              key={entry.id}
              className="group relative bg-[#101218] border border-zinc-800/80 hover:border-red-500/50 rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-red-950/20 flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                <img
                  src={entry.backdropUrl || entry.posterUrl}
                  alt={entry.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101218] via-transparent to-black/40" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase rounded-md bg-black/80 backdrop-blur-md text-red-400 border border-red-500/30">
                    {entry.type === 'movie' ? 'Movie' : 'Web Series'}
                  </span>
                  {entry.status === 'upcoming' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Premiere
                    </span>
                  )}
                </div>

                {/* Reminder button */}
                <button
                  onClick={() => toggleReminder(entry.id)}
                  title={hasReminder ? t('reminder_set') : t('remind_me')}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition ${
                    hasReminder
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                      : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80'
                  }`}
                >
                  {hasReminder ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </button>
              </div>

              {/* Details Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5 font-medium">
                    <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>{new Date(entry.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">★ {entry.rating.toFixed(1)}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition line-clamp-1">
                    {entry.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {entry.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {entry.genres.slice(0, 3).map((g, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-zinc-800/60">
                  <button
                    onClick={() => onOpenDetails(entry.item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড করুন</span>
                  </button>
                  <button
                    onClick={() => onOpenDetails(entry.item)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                    title={t('details')}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
