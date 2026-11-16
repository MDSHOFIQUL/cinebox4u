import React, { useState } from 'react';
import { Language } from '../../types';
import { Globe2, Plus, Edit2, Trash2, X } from 'lucide-react';

interface ManageLanguagesProps {
  languages: Language[];
  onSaveLanguage: (language: Language) => Promise<void>;
  onDeleteLanguage: (languageId: string) => Promise<void>;
}

export const ManageLanguages: React.FC<ManageLanguagesProps> = ({
  languages,
  onSaveLanguage,
  onDeleteLanguage,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isPopular, setIsPopular] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setId('');
    setName('');
    setCode('');
    setIsPopular(true);
  };

  const handleEdit = (l: Language) => {
    setId(l.id);
    setName(l.name);
    setCode(l.code);
    setIsPopular(l.isPopular || false);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return alert('Name and Code required');
    setIsSubmitting(true);

    const docId = id || `lang-${code.toLowerCase()}`;
    const payload: Language = {
      id: docId,
      name,
      code: code.toLowerCase(),
      isPopular,
    };

    try {
      await onSaveLanguage(payload);
      setIsFormOpen(false);
      resetForm();
    } catch (e: any) {
      alert(`Error saving language: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Languages Configuration</h1>
          <p className="text-xs text-zinc-400">
            Configure multi-language metadata, audio tracks, and user filtering presets.
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
          <span>{isFormOpen ? 'Close Form' : 'Add Language'}</span>
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-6 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white pb-2 border-b border-zinc-800">
            {id ? `Edit Language: ${name}` : 'Add New Language'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Language Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Japanese"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">ISO Code *</label>
              <input
                type="text"
                required
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ja"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="accent-red-600 rounded"
                />
                <span>Show in Popular Filter Chips</span>
              </label>
            </div>
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
              {isSubmitting ? 'Saving...' : 'Save Language'}
            </button>
          </div>
        </form>
      )}

      {/* Languages Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Language</th>
              <th className="py-3 px-4">ISO Code</th>
              <th className="py-3 px-4">Popular Filter</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {languages.map((l) => (
              <tr key={l.id} className="hover:bg-zinc-800/30 transition">
                <td className="py-3 px-4 font-bold text-white">{l.name}</td>
                <td className="py-3 px-4 font-mono uppercase text-zinc-400">{l.code}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.isPopular
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {l.isPopular ? 'Featured' : 'Standard'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(l)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete language "${l.name}"?`)) onDeleteLanguage(l.id);
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
