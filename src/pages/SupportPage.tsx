import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { SupportTicket } from '../types';
import { createSupportTicket, fetchUserSupportTickets } from '../services/dataService';
import { HelpCircle, Send, Plus, CheckCircle2, Clock, AlertCircle, LifeBuoy } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'streaming' | 'subtitles' | 'account' | 'billing' | 'content_request'>('streaming');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchUserSupportTickets(user.uid);
        if (list && list.length > 0) {
          setTickets(list);
        } else {
          // Sample initial ticket for pleasant UI
          setTickets([
            {
              id: 'tick_sample_01',
              userId: user.uid,
              userEmail: user.email || 'user@cinebox4u.com',
              userName: user.displayName || 'CineBox Viewer',
              subject: 'Bengali Subtitle Request for Blockbuster Series',
              category: 'subtitles',
              message: 'Could you please add synchronized Bengali subtitles for the latest episodes?',
              status: 'resolved',
              priority: 'medium',
              adminResponse: 'Bengali subtitles have been generated and published to the WebVTT track. Enjoy streaming!',
              createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
              updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.warn('Error loading support tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    try {
      const created = await createSupportTicket(
        user.uid,
        user.email || 'user@cinebox4u.com',
        subject.trim(),
        category,
        message.trim()
      );
      setTickets([created, ...tickets]);
      setIsCreating(false);
      setSubject('');
      setMessage('');
      setSuccessToast('Your support ticket has been received by CineBox4u engineers.');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Failed to submit ticket: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-bold mb-3">
            <LifeBuoy className="w-3.5 h-3.5" />
            24/7 Platform Assistance
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-red-500" />
            {t('nav_support')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Having playback buffering, audio/subtitle desync, or want to request a movie or series? Open a ticket below.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t('submit_ticket')}
        </button>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
          Your Inquiries ({tickets.length})
        </h3>

        {tickets.map((t) => (
          <div
            key={t.id}
            className="p-5 bg-[#101218] border border-zinc-800/80 rounded-2xl space-y-3 hover:border-zinc-700 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-white">{t.subject}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {t.category}
                </span>
              </div>

              {t.status === 'resolved' ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolved
                </span>
              ) : t.status === 'in_progress' ? (
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  In Progress
                </span>
              ) : (
                <span className="text-xs text-zinc-400 font-bold flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  Open
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">{t.message}</p>

            {/* Admin Response block if present */}
            {t.adminResponse && (
              <div className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  CineBox4u Support Response
                </span>
                <p className="text-xs text-zinc-200">{t.adminResponse}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Ticket Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-[#111319] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold text-white">{t('submit_ticket')}</h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {t('ticket_category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white"
              >
                <option value="streaming">Streaming & Buffering Issue</option>
                <option value="subtitles">Missing or Desynced Subtitles</option>
                <option value="account">Account & Profile Settings</option>
                <option value="content_request">Movie / Series Request</option>
                <option value="general">General Feedback & Suggestions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {t('ticket_subject')}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Video buffer on Server 2 during peak hours"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {t('ticket_message')}
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe the issue, device used, or title name in detail..."
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
