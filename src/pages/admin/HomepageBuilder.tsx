import React, { useState } from 'react';
import { HomepageSection, SiteSettings } from '../../types';
import { LayoutGrid, ArrowUp, ArrowDown, Eye, EyeOff, Save, Check, RefreshCw } from 'lucide-react';

interface HomepageBuilderProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => void;
}

const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: 'hero', title: 'Featured Premiere Billboard', type: 'hero', isVisible: true, order: 0 },
  { id: 'continue', title: 'Continue Watching', type: 'continue_watching', isVisible: true, order: 1 },
  { id: 'recommended', title: 'Recommended For You', type: 'recommended', isVisible: true, order: 2 },
  { id: 'top10', title: 'Top 10 CineBox Movies Today', type: 'top_10', isVisible: true, order: 3 },
  { id: 'trending', title: 'Trending Global Titles', type: 'trending', isVisible: true, order: 4 },
  { id: 'latest', title: 'Fresh Releases & Premieres', type: 'latest', isVisible: true, order: 5 },
  { id: 'categories', title: 'Explore by Category & Genre', type: 'category', isVisible: true, order: 6 },
];

export const HomepageBuilder: React.FC<HomepageBuilderProps> = ({ settings, onSaveSettings }) => {
  const [sections, setSections] = useState<HomepageSection[]>(() => {
    return settings.homepageSections && settings.homepageSections.length > 0
      ? settings.homepageSections
      : DEFAULT_SECTIONS;
  });

  const [savedToast, setSavedToast] = useState(false);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Recalculate order index
    const reordered = copy.map((sec, idx) => ({ ...sec, order: idx }));
    setSections(reordered);
  };

  const toggleVisibility = (id: string) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const updateTitle = (id: string, newTitle: string) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      homepageSections: sections,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-red-500" />
            Dynamic Homepage Layout Builder
          </h2>
          <p className="text-xs text-zinc-400">
            Customize homepage section order, toggle row visibility, and rename category headers live.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition self-start sm:self-auto"
        >
          {savedToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedToast ? 'Layout Saved!' : 'Save Homepage Layout'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition ${
              sec.isVisible
                ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                : 'bg-zinc-950/40 border-zinc-900 opacity-60'
            }`}
          >
            {/* Left: Reorder buttons & Position */}
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-mono font-bold text-zinc-500">
                #{idx + 1}
              </span>

              <div className="flex flex-col gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => moveSection(idx, 'up')}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 text-zinc-300"
                  title="Move section up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  disabled={idx === sections.length - 1}
                  onClick={() => moveSection(idx, 'down')}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 text-zinc-300"
                  title="Move section down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              {/* Title Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => updateTitle(sec.id, e.target.value)}
                  className="w-full sm:w-80 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-red-500"
                />
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  Type: {sec.type}
                </span>
              </div>
            </div>

            {/* Right: Toggle Visibility */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => toggleVisibility(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  sec.isVisible
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-red-950/30 text-red-400 border border-red-500/20'
                }`}
              >
                {sec.isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{sec.isVisible ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
