import React, { useState } from 'react';
import { SupportTicket } from '../../types';
import { LifeBuoy, Clock, CheckCircle2, MessageSquare, Send, AlertTriangle } from 'lucide-react';

export const SupportTicketManager: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'tick_01',
      userId: 'usr_01',
      userEmail: 'farhan@gmail.com',
      userName: 'Farhan Ahmed',
      subject: 'Buffering on 4K Stream Server',
      category: 'streaming',
      message: 'When streaming in 4K resolution on Server 1, there is occasional buffering every 5 minutes.',
      status: 'open',
      priority: 'high',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'tick_02',
      userId: 'usr_02',
      userEmail: 'shafiq@gmail.com',
      userName: 'Shafiqul Islam',
      subject: 'Add Bengali Subtitles for Web Series Season 2',
      category: 'subtitles',
      message: 'Please update WebVTT subtitle track for Bengali language.',
      status: 'resolved',
      priority: 'medium',
      adminResponse: 'Bengali subtitle track has been synced and published via WebVTT Studio.',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleSendReply = (newStatus: 'in_progress' | 'resolved') => {
    if (!activeTicket) return;

    setTickets(
      tickets.map((t) =>
        t.id === activeTicket.id
          ? {
              ...t,
              status: newStatus,
              adminResponse: replyText.trim() || t.adminResponse,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    setActiveTicket(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-red-500" />
            Support Ticket Help Desk
          </h2>
          <p className="text-xs text-zinc-400">
            Triage user playback inquiries, stream buffering reports, and subtitle requests.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition ${
                filter === s ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-700 transition"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-zinc-400 font-bold">#{ticket.id}</span>
                <span className="text-xs font-bold text-white">{ticket.subject}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {ticket.category}
                </span>
                {ticket.priority === 'high' && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                    High Priority
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 max-w-2xl">{ticket.message}</p>
              <p className="text-[10px] text-zinc-500 mt-1">
                From: <span className="text-zinc-300">{ticket.userName}</span> ({ticket.userEmail}) • {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              {ticket.status === 'resolved' ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolved
                </span>
              ) : (
                <button
                  onClick={() => {
                    setActiveTicket(ticket);
                    setReplyText(ticket.adminResponse || '');
                  }}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Respond
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111319] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Respond to Ticket: {activeTicket.subject}
            </h3>
            <p className="text-xs text-zinc-300 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              {activeTicket.message}
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Official Admin Response
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type resolution message for user..."
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSendReply('in_progress')}
                className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl"
              >
                Save as In Progress
              </button>
              <button
                type="button"
                onClick={() => handleSendReply('resolved')}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolve Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
