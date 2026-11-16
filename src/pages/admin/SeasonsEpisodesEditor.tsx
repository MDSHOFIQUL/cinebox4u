import React, { useState } from 'react';
import { Plus, Trash2, Layers, Clapperboard, ListPlus, Link2 } from 'lucide-react';
import { MovieSeason, MovieEpisode, SeasonGroup, SeasonKind } from '../../types';

interface SeasonsEpisodesEditorProps {
  group: SeasonGroup;
  /** All seasons/parts of the movie (both groups). This editor only touches its own group. */
  seasons: MovieSeason[];
  onChange: (next: MovieSeason[]) => void;
}

const GROUP_COPY: Record<
  SeasonGroup,
  { title: string; subtitle: string; addLabel: string; defaultKind: SeasonKind; kinds: SeasonKind[] }
> = {
  series: {
    title: 'সিজন ও সিরিজ এপিসোড (Season & Series Episodes)',
    subtitle: 'Season 1, Season 2 ... প্রতিটি সিজনে অনেক এপিসোড ও লিংক বসান',
    addLabel: 'নতুন সিজন যোগ করুন',
    defaultKind: 'season',
    kinds: ['season'],
  },
  cartoon: {
    title: 'কার্টুন সিরিজ পার্ট (Cartoon Series Parts)',
    subtitle: 'Part 1, Part 2 বা Season 1, Season 2 — প্রতিটিতে অনেক এপিসোড ও লিংক বসান',
    addLabel: 'নতুন পার্ট / সিজন যোগ করুন',
    defaultKind: 'part',
    kinds: ['part', 'season'],
  },
};

const inputCls =
  'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500';

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const kindLabel = (k: SeasonKind) => (k === 'season' ? 'Season' : 'Part');

export const SeasonsEpisodesEditor: React.FC<SeasonsEpisodesEditorProps> = ({ group, seasons, onChange }) => {
  const copy = GROUP_COPY[group];
  const mine = seasons.filter((s) => s.group === group);
  const [bulkText, setBulkText] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(mine[0]?.id ?? null);

  const totalEpisodes = mine.reduce((sum, s) => sum + s.episodes.length, 0);

  const replaceMine = (nextMine: MovieSeason[]) => {
    const others = seasons.filter((s) => s.group !== group);
    onChange([...others, ...nextMine]);
  };

  const updateSeason = (id: string, patch: Partial<MovieSeason>) =>
    replaceMine(mine.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addSeason = () => {
    const kind = copy.defaultKind;
    const nextNumber = Math.max(0, ...mine.filter((s) => s.kind === kind).map((s) => s.number)) + 1;
    const created: MovieSeason = { id: uid('ssn'), group, kind, number: nextNumber, title: '', episodes: [] };
    replaceMine([...mine, created]);
    setOpenId(created.id);
  };

  const removeSeason = (id: string) => {
    const target = mine.find((s) => s.id === id);
    if (target && target.episodes.length > 0) {
      const ok = window.confirm(
        `${kindLabel(target.kind)} ${target.number} মুছে ফেললে এর ${target.episodes.length} টি এপিসোডও মুছে যাবে। নিশ্চিত?`
      );
      if (!ok) return;
    }
    replaceMine(mine.filter((s) => s.id !== id));
  };

  const addEpisode = (seasonId: string) => {
    const season = mine.find((s) => s.id === seasonId);
    if (!season) return;
    const nextNo = Math.max(0, ...season.episodes.map((e) => e.number)) + 1;
    const ep: MovieEpisode = { id: uid('ep'), number: nextNo, title: '', streamUrl: '', downloadUrl: '' };
    updateSeason(seasonId, { episodes: [...season.episodes, ep] });
  };

  const updateEpisode = (seasonId: string, epId: string, patch: Partial<MovieEpisode>) => {
    const season = mine.find((s) => s.id === seasonId);
    if (!season) return;
    updateSeason(seasonId, {
      episodes: season.episodes.map((e) => (e.id === epId ? { ...e, ...patch } : e)),
    });
  };

  const removeEpisode = (seasonId: string, epId: string) => {
    const season = mine.find((s) => s.id === seasonId);
    if (!season) return;
    updateSeason(seasonId, { episodes: season.episodes.filter((e) => e.id !== epId) });
  };

  /**
   * Bulk paste: one link per line.
   * Accepted line formats:
   *   https://link
   *   https://watch-link | https://download-link
   *   Episode title | https://watch-link | https://download-link
   * A single link is used for both Watch and Download (you can edit each episode afterwards).
   */
  const applyBulk = (seasonId: string) => {
    const season = mine.find((s) => s.id === seasonId);
    const raw = (bulkText[seasonId] || '').trim();
    if (!season || !raw) return;
    let nextNo = Math.max(0, ...season.episodes.map((e) => e.number));
    const created: MovieEpisode[] = [];
    raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
        const isUrl = (v: string) => /^https?:\/\//i.test(v);
        let title = '';
        let urls: string[] = [];
        if (parts.length === 1) {
          urls = isUrl(parts[0]) ? [parts[0]] : [];
        } else if (isUrl(parts[0])) {
          urls = parts.filter(isUrl);
        } else {
          title = parts[0];
          urls = parts.slice(1).filter(isUrl);
        }
        if (urls.length === 0) return;
        nextNo += 1;
        created.push({
          id: uid('ep'),
          number: nextNo,
          title,
          streamUrl: urls[0],
          downloadUrl: urls[1] || urls[0],
        });
      });
    if (created.length === 0) {
      window.alert('কোনো সঠিক লিংক পাওয়া যায়নি। প্রতি লাইনে একটি https:// লিংক দিন।');
      return;
    }
    updateSeason(seasonId, { episodes: [...season.episodes, ...created] });
    setBulkText((prev) => ({ ...prev, [seasonId]: '' }));
  };

  return (
    <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
            {group === 'series' ? <Layers className="w-4 h-4" /> : <Clapperboard className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white">{copy.title}</h3>
            <p className="text-[11px] text-zinc-500">{copy.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mine.length > 0 && (
            <span className="text-[11px] font-bold text-amber-400 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 tabular-nums">
              {mine.length} টি {group === 'series' ? 'সিজন' : 'পার্ট/সিজন'} · {totalEpisodes} টি এপিসোড
            </span>
          )}
          <button
            type="button"
            onClick={addSeason}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{copy.addLabel}</span>
          </button>
        </div>
      </div>

      {mine.length === 0 && (
        <p className="text-[11px] text-zinc-600 border border-dashed border-zinc-800 rounded-xl px-3 py-3">
          এখনো কিছু যোগ করা হয়নি। এই অংশ ফাঁকা রাখলে মুভি আগের মতোই থাকবে।
        </p>
      )}

      {mine.map((season) => {
        const isOpen = openId === season.id;
        return (
          <div key={season.id} className="border border-zinc-800 rounded-xl bg-zinc-950">
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : season.id)}
                className="flex-1 min-w-[140px] text-left text-xs font-bold text-white cursor-pointer"
              >
                {kindLabel(season.kind)} {season.number}
                {season.title ? ` — ${season.title}` : ''}
                <span className="ml-2 text-[11px] font-semibold text-emerald-400">
                  {season.episodes.length} টি এপিসোড
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeSeason(season.id)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                aria-label="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {isOpen && (
              <div className="border-t border-zinc-800 p-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {copy.kinds.length > 1 && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">ধরন</label>
                      <select
                        value={season.kind}
                        onChange={(e) => updateSeason(season.id, { kind: e.target.value as SeasonKind })}
                        className={inputCls}
                      >
                        {copy.kinds.map((k) => (
                          <option key={k} value={k}>
                            {kindLabel(k)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">নম্বর</label>
                    <input
                      type="number"
                      min={1}
                      value={season.number}
                      onChange={(e) => updateSeason(season.id, { number: Math.max(1, Number(e.target.value) || 1) })}
                      className={inputCls}
                    />
                  </div>
                  <div className={copy.kinds.length > 1 ? '' : 'sm:col-span-2'}>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                      নাম (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={season.title || ''}
                      onChange={(e) => updateSeason(season.id, { title: e.target.value })}
                      placeholder="যেমন: The Beginning"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Bulk paste */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>একসাথে অনেক লিংক বসান (প্রতি লাইনে একটি এপিসোড)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={bulkText[season.id] || ''}
                    onChange={(e) => setBulkText((prev) => ({ ...prev, [season.id]: e.target.value }))}
                    placeholder={
                      'https://.../ep1.mp4\nhttps://.../ep2.mp4\nEpisode নাম | https://watch-link | https://download-link'
                    }
                    className={`${inputCls} font-mono resize-y`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] text-zinc-500">
                      একটি লিংক দিলে সেটাই Watch ও Download দুটোতে বসবে। পরে প্রতিটি আলাদা করে এডিট করা যাবে।
                    </p>
                    <button
                      type="button"
                      onClick={() => applyBulk(season.id)}
                      className="shrink-0 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      এপিসোড তৈরি করুন
                    </button>
                  </div>
                </div>

                {/* Episodes list */}
                {season.episodes.length > 0 && (
                  <div className="space-y-2">
                    {[...season.episodes]
                      .sort((a, b) => a.number - b.number)
                      .map((ep) => (
                        <div
                          key={ep.id}
                          className="grid grid-cols-12 gap-2 items-center bg-zinc-900/40 border border-zinc-800 rounded-xl p-2"
                        >
                          <div className="col-span-4 sm:col-span-1">
                            <input
                              type="number"
                              min={1}
                              value={ep.number}
                              onChange={(e) =>
                                updateEpisode(season.id, ep.id, { number: Math.max(1, Number(e.target.value) || 1) })
                              }
                              title="Episode number"
                              className={`${inputCls} text-center font-bold`}
                            />
                          </div>
                          <div className="col-span-8 sm:col-span-3">
                            <input
                              type="text"
                              value={ep.title || ''}
                              onChange={(e) => updateEpisode(season.id, ep.id, { title: e.target.value })}
                              placeholder={`Episode ${ep.number} নাম`}
                              className={inputCls}
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-3 relative">
                            <input
                              type="text"
                              value={ep.streamUrl || ''}
                              onChange={(e) => updateEpisode(season.id, ep.id, { streamUrl: e.target.value })}
                              placeholder="Watch লিংক (.mp4 / .m3u8 / YouTube / Drive)"
                              className={`${inputCls} font-mono`}
                            />
                          </div>
                          <div className="col-span-9 sm:col-span-3">
                            <input
                              type="text"
                              value={ep.downloadUrl || ''}
                              onChange={(e) => updateEpisode(season.id, ep.id, { downloadUrl: e.target.value })}
                              placeholder="Download লিংক (Direct / MEGA / Drive)"
                              className={`${inputCls} font-mono`}
                            />
                          </div>
                          <div className="col-span-3 sm:col-span-1 flex items-center gap-1">
                            <input
                              type="text"
                              value={ep.fileSize || ''}
                              onChange={(e) => updateEpisode(season.id, ep.id, { fileSize: e.target.value })}
                              placeholder="সাইজ"
                              className={inputCls}
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeEpisode(season.id, ep.id)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                              aria-label="Remove episode"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => addEpisode(season.id)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>একটি এপিসোড যোগ করুন</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
