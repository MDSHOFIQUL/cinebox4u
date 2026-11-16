import React, { useState } from 'react';
import { Movie, Series } from '../../types';
import { CheckCircle2, XCircle, Clock, FileCheck, Film, AlertCircle, Shield } from 'lucide-react';

interface ContentApprovalsProps {
  movies: Movie[];
  series: Series[];
  onApproveItem: (item: Movie | Series) => void;
  onRejectItem: (item: Movie | Series, reason: string) => void;
}

export const ContentApprovals: React.FC<ContentApprovalsProps> = ({
  movies,
  series,
  onApproveItem,
  onRejectItem,
}) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectingItem, setRejectingItem] = useState<(Movie | Series) | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Sample pending drafts for multi-editor workflow demonstration
  const allItems: ((Movie | Series) & { approvalStatus: 'pending' | 'approved' | 'rejected'; submittedBy?: string })[] = [
    ...movies.map((m) => ({
      ...m,
      approvalStatus: m.published ? ('approved' as const) : ('pending' as const),
      submittedBy: 'editor_rahim@cinebox4u.com',
    })),
    ...series.map((s) => ({
      ...s,
      approvalStatus: s.published ? ('approved' as const) : ('pending' as const),
      submittedBy: 'editor_kareem@cinebox4u.com',
    })),
  ];

  const filtered = allItems.filter((i) => i.approvalStatus === filter);

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;
    onRejectItem(rejectingItem, rejectReason);
    setRejectingItem(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-red-500" />
            Content Publishing & Approval Workflow
          </h2>
          <p className="text-xs text-zinc-400">
            Review draft submissions from editors before publishing to the live CineBox4u platform.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          {(['pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition ${
                filter === status ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No {filter} content items found.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-zinc-700 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                  <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-zinc-800 text-zinc-300">
                      {item.type}
                    </span>
                    <span className="text-xs text-zinc-400">{item.releaseYear}</span>
                    <span className="text-xs text-amber-400 font-bold">★ {item.rating}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-1 max-w-md mt-0.5">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Submitted by: <span className="text-zinc-400">{item.submittedBy}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                {filter === 'pending' && (
                  <>
                    <button
                      onClick={() => onApproveItem(item)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => setRejectingItem(item)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-red-600/20 text-zinc-300 hover:text-red-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                {filter === 'approved' && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Live On Platform
                  </span>
                )}
                {filter === 'rejected' && (
                  <span className="text-xs text-red-400 font-bold flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                    <XCircle className="w-3.5 h-3.5" />
                    Needs Revisions
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleConfirmReject}
            className="w-full max-w-md bg-[#111319] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">
              Reject Submission: {rejectingItem.title}
            </h3>
            <p className="text-xs text-zinc-400">
              Provide actionable feedback for the editor to revise and re-submit this title.
            </p>

            <textarea
              rows={4}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Subtitles have audio desync in episode 2, or backdrop resolution is below 1080p."
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
