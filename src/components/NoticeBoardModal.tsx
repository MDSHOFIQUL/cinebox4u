import React from 'react';
import { X, Bell, AlertCircle, CheckCircle2, Radio, Sparkles } from 'lucide-react';

interface NoticeBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement?: string;
}

export const NoticeBoardModal: React.FC<NoticeBoardModalProps> = ({
  isOpen,
  onClose,
  announcement = '',
}) => {
  if (!isOpen) return null;

  const trimmedAnnouncement = announcement.trim();
  const isDefaultWelcome = trimmedAnnouncement
    .toLowerCase()
    .includes('stream your favorite 4k & 1080p movies with multi-server playback');

  const notices = [
    ...(trimmedAnnouncement && !isDefaultWelcome
      ? [
          {
            id: 'n1',
            title: '📢 অফিসিয়াল ব্রডকাস্ট নোটিশ',
            text: trimmedAnnouncement,
            priority: 'high',
            time: 'আজকের সক্রিয় বার্তা',
          },
        ]
      : []),
    {
      id: 'n2',
      title: '⚡ MEGA ও Google Drive হাই-স্পিড সাপোর্ট',
      text: 'যেকোনো মুভি ও সিরিজে এখন সরাসরি MEGA ও Google Drive সার্ভার লিঙ্ক যুক্ত করা হয়েছে। বাফারিং ছাড়া স্ট্রিমিং ও ১-ক্লিক ফুল HD ডাউনলোডের সুবিধা চালু রয়েছে।',
      priority: 'normal',
      time: 'সিস্টেম আপডেট',
    },
    {
      id: 'n3',
      title: '🍿 নতুন ক্যাটাগরি ও ভাষা আপডেট',
      text: 'বাংলা, ইংলিশ, তামিল, হিন্দি ও এনিমি সহ ১৪টি সুসজ্জিত ক্যাটাগরি এবং ১-ক্লিক বাংলা/ইংলিশ সুইচিং সক্রিয় করা হয়েছে।',
      priority: 'normal',
      time: 'ফিচার আপডেট',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111218] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black shadow-lg shadow-amber-950/60 font-black">
            <Bell className="w-6 h-6 fill-black" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>নোটিশ বোর্ড (Notice Board)</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </h3>
            <p className="text-xs text-zinc-400">
              CineBox4u কর্তৃপক্ষের সকল গুরুত্বপূর্ণ ঘোষণা ও নোটিফিকেশন
            </p>
          </div>
        </div>

        {/* Notices Cards List */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {notices.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 hover:border-amber-500/50 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>{n.title}</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{n.time}</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{n.text}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">নোটিশ প্রতিনিয়ত অ্যাডমিন প্যানেল থেকে হালনাগাদ করা হয়।</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
          >
            বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
