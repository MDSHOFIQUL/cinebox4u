import React, { useState } from 'react';
import { Series, Category, Language } from '../../types';
import { Tv, Plus, Edit2, Trash2, Search, X, Star } from 'lucide-react';

interface ManageSeriesProps {
  series: Series[];
  categories: Category[];
  languages: Language[];
  onSaveSeries: (series: Series) => Promise<void>;
  onDeleteSeries: (seriesId: string) => Promise<void>;
  openCreateForm?: boolean;
}

export const ManageSeries: React.FC<ManageSeriesProps> = ({
  series,
  categories,
  languages,
  onSaveSeries,
  onDeleteSeries,
  openCreateForm = false,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(openCreateForm);
  const [editingId, setEditingId] = useState('');
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [posterUrl, setPosterUrl] = useState('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80');
  const [backdropUrl, setBackdropUrl] = useState('https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1600&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(2025);
  const [language, setLanguage] = useState('Korean');
  const [category, setCategory] = useState('International Dramas');
  const [genresInput, setGenresInput] = useState('K-Drama, Romance, Mystery');
  const [rating, setRating] = useState<number>(9.0);
  const [seasonsCount, setSeasonsCount] = useState<number>(1);
  const [totalEpisodes, setTotalEpisodes] = useState<number>(8);
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEditingId('');
    setTitle('');
    setOriginalTitle('');
    setDescription('');
    setReleaseYear(2025);
    setSeasonsCount(1);
    setTotalEpisodes(8);
    setRating(9.0);
    setIsPublished(true);
    setIsFeatured(false);
  };

  const handleEdit = (s: Series) => {
    setEditingId(s.id);
    setTitle(s.title);
    setOriginalTitle(s.originalTitle || '');
    setPosterUrl(s.posterUrl);
    setBackdropUrl(s.backdropUrl);
    setDescription(s.description);
    setReleaseYear(s.releaseYear);
    setLanguage(s.language);
    setCategory(s.category);
    setGenresInput(s.genres?.join(', ') || '');
    setRating(s.rating || 8.5);
    setSeasonsCount(s.seasonsCount || 1);
    setTotalEpisodes(s.totalEpisodes || 1);
    setIsPublished(s.isPublished ?? s.published ?? true);
    setIsFeatured(s.isFeatured || false);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Series title required');
    setIsSubmitting(true);

    const genres = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const payload: Series = {
      id: editingId || `ser-${Date.now()}`,
      title,
      originalTitle: originalTitle || undefined,
      type: 'series',
      posterUrl,
      backdropUrl,
      description,
      releaseYear: Number(releaseYear),
      language,
      category,
      genres: genres.length > 0 ? genres : ['Drama'],
      rating: Number(rating),
      seasonsCount: Number(seasonsCount),
      totalEpisodes: Number(totalEpisodes),
      isPublished,
      isFeatured,
      viewsCount: 1500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveSeries(payload);
      setIsFormOpen(false);
      resetForm();
    } catch (e: any) {
      alert(`Error saving series: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = series.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Manage Web Series & Dramas</h1>
          <p className="text-xs text-zinc-400">
            Create TV series, organize seasons count, and publish dramatic sagas.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(!isFormOpen);
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60 transition"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isFormOpen ? 'Close Form' : 'Add New Series'}</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="p-6 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-zinc-800">
            <Tv className="w-4 h-4 text-red-500" />
            <span>{editingId ? `Edit Series: ${title}` : 'Add New Series'}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {languages.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Seasons Count</label>
                <input
                  type="number"
                  min={1}
                  value={seasonsCount}
                  onChange={(e) => setSeasonsCount(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Total Episodes</label>
                <input
                  type="number"
                  min={1}
                  value={totalEpisodes}
                  onChange={(e) => setTotalEpisodes(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Release Year</label>
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Poster URL</label>
                <input
                  type="url"
                  required
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Backdrop URL</label>
                <input
                  type="url"
                  required
                  value={backdropUrl}
                  onChange={(e) => setBackdropUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Description</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <span>Published</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <span>Featured on Hero</span>
              </label>
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
                {isSubmitting ? 'Saving...' : 'Save Series'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Series Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Series Title</th>
              <th className="py-3 px-4">Language</th>
              <th className="py-3 px-4">Seasons / Episodes</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-800/30 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img src={s.posterUrl} alt={s.title} className="w-8 h-11 rounded object-cover" />
                    <div>
                      <span className="font-bold text-white block">{s.title}</span>
                      <span className="text-[10px] text-zinc-500">{s.releaseYear} • {s.category}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{s.language}</td>
                <td className="py-3 px-4 font-mono">
                  {s.seasonsCount} Seasons / {s.totalEpisodes} Eps
                </td>
                <td className="py-3 px-4 font-bold text-amber-400">★ {s.rating}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.isPublished
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {s.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete series ${s.title}?`)) onDeleteSeries(s.id);
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
