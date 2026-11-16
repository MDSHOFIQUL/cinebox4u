import React, { useState } from 'react';
import { Series, Episode, VideoServer, VideoServerType } from '../../types';
import { Layers, Plus, Edit2, Trash2, Server, Download, X, Star } from 'lucide-react';

interface ManageEpisodesProps {
  series: Series[];
  episodes: Episode[];
  onSaveEpisode: (episode: Episode) => Promise<void>;
  onDeleteEpisode: (episodeId: string) => Promise<void>;
}

export const ManageEpisodes: React.FC<ManageEpisodesProps> = ({
  series,
  episodes,
  onSaveEpisode,
  onDeleteEpisode,
}) => {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(series[0]?.id || '');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState('');

  // Form states
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('52m');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&auto=format&fit=crop&q=80');
  const [streamUrl, setStreamUrl] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  const [serverType, setServerType] = useState<VideoServerType>('hls');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSeries = series.find((s) => s.id === selectedSeriesId);
  const currentEpisodes = episodes.filter((e) => e.seriesId === selectedSeriesId);

  const resetForm = () => {
    setEditingId('');
    setTitle('');
    setDescription('');
    setDuration('50m');
    setEpisodeNumber((currentEpisodes.length || 0) + 1);
  };

  const handleEdit = (ep: Episode) => {
    setEditingId(ep.id);
    setSeasonNumber(ep.seasonNumber);
    setEpisodeNumber(ep.episodeNumber);
    setTitle(ep.title);
    setDescription(ep.description || '');
    setDuration(ep.duration);
    setThumbnail(ep.thumbnail);
    if (ep.videoServers && ep.videoServers.length > 0) {
      setStreamUrl(ep.videoServers[0].streamUrl);
      setServerType(ep.videoServers[0].serverType);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Episode title is required');
    setIsSubmitting(true);

    const docId = editingId || `ep-${selectedSeriesId}-${seasonNumber}-${episodeNumber}-${Date.now()}`;
    const payload: Episode = {
      id: docId,
      seriesId: selectedSeriesId,
      seasonNumber: Number(seasonNumber),
      episodeNumber: Number(episodeNumber),
      title,
      description,
      duration,
      thumbnail,
      videoServers: [
        {
          id: `srv-${docId}-1`,
          mediaId: docId,
          mediaType: 'episode',
          serverName: 'Server 1 - Primary HLS',
          serverType,
          streamUrl,
          quality: '1080p',
          status: 'active',
          priority: 1,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    try {
      await onSaveEpisode(payload);
      setIsFormOpen(false);
      resetForm();
    } catch (e: any) {
      alert(`Error saving episode: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Episodes Management</h1>
          <p className="text-xs text-zinc-400">
            Assign episode numbers, streaming mirror links, and thumbnails.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(!isFormOpen);
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isFormOpen ? 'Close Form' : 'Add New Episode'}</span>
        </button>
      </div>

      {/* Series Selector Bar */}
      <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-center gap-3">
        <label className="text-xs font-bold text-zinc-400 uppercase">Select Target Series:</label>
        <select
          value={selectedSeriesId}
          onChange={(e) => setSelectedSeriesId(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
        >
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.language})
            </option>
          ))}
        </select>
        {selectedSeries && (
          <span className="text-xs text-zinc-500 hidden sm:inline">
            Total {currentEpisodes.length} episodes configured
          </span>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="p-6 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-zinc-800">
            <Layers className="w-4 h-4 text-red-500" />
            <span>{editingId ? `Edit Episode: ${title}` : `Add Episode for ${selectedSeries?.title}`}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  Season Number
                </label>
                <input
                  type="number"
                  min={1}
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  Episode Number
                </label>
                <input
                  type="number"
                  min={1}
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  Episode Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Episode 1: The Beginning"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 52m"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  required
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Video Server Stream */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-zinc-300 uppercase">Primary Streaming Link</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1">Type</label>
                  <select
                    value={serverType}
                    onChange={(e) => setServerType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white"
                  >
                    <option value="hls">HLS (M3U8)</option>
                    <option value="direct">Direct MP4</option>
                    <option value="gdrive">Google Drive</option>
                    <option value="mega">MEGA</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-zinc-500 mb-1">Stream Endpoint / URL</label>
                  <input
                    type="url"
                    required
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Synopsis</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
              >
                {isSubmitting ? 'Saving...' : 'Save Episode'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Episodes Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Season / Episode</th>
              <th className="py-3 px-4">Episode Title</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Server Type</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {currentEpisodes.map((ep) => (
              <tr key={ep.id} className="hover:bg-zinc-800/30 transition">
                <td className="py-3 px-4 font-mono font-bold text-red-400">
                  S{ep.seasonNumber} • E{ep.episodeNumber}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={ep.thumbnail || selectedSeries?.posterUrl}
                      alt={ep.title}
                      className="w-12 h-8 rounded object-cover"
                    />
                    <div>
                      <span className="font-bold text-white block">{ep.title}</span>
                      <span className="text-[10px] text-zinc-500 line-clamp-1">{ep.description}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-zinc-400 font-mono">{ep.duration}</td>
                <td className="py-3 px-4 uppercase text-[10px] font-mono text-zinc-300">
                  {ep.videoServers?.[0]?.serverType || 'HLS'}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(ep)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete episode "${ep.title}"?`)) onDeleteEpisode(ep.id);
                      }}
                      className="p-1.5 bg-red-950/30 hover:bg-red-900/60 text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
