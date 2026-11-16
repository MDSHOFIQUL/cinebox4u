import React, { useState } from 'react';
import { Bell, Send, Trash2, CheckCircle2, AlertCircle, Radio, Sparkles } from 'lucide-react';
import { SiteSettings } from '../../types';

interface ManageNoticesProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

export const ManageNotices: React.FC<ManageNoticesProps> = ({
  settings,
  onSaveSettings,
}) => {
  const cleanInitialAnnouncement =
    settings.announcement &&
    !settings.announcement
      .toLowerCase()
      .includes('stream your favorite 4k & 1080p movies with multi-server playback')
      ? settings.announcement
      : '';

  const [noticeText, setNoticeText] = useState(cleanInitialAnnouncement);
  const [isActive, setIsActive] = useState(Boolean(cleanInitialAnnouncement) && (settings.announcementActive ?? false));
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Active notices list (can be extended with multiple notices)
  const [noticesList, setNoticesList] = useState<
    { id: string; text: string; active: boolean; date: string; priority: 'high' | 'normal' }[]
  >(() => [
    ...(cleanInitialAnnouncement
      ? [
          {
            id: 'not-1',
            text: cleanInitialAnnouncement,
            active: settings.announcementActive ?? false,
            date: new Date().toLocaleDateString(),
            priority: 'high' as const,
          },
        ]
      : []),
    {
      id: 'not-2',
      text: '⚡ MEGA ও Google Drive সার্ভার ১-ক্লিক হাই-স্পিড ডাউনলোড সক্রিয় করা হয়েছে। কোনো বাফারিং ছাড়াই ফুল HD স্ট্রিমিং উপভোগ করুন।',
      active: true,
      date: 'আজকের নোটিশ',
      priority: 'high',
    },
  ]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeText.trim()) return;

    setIsBroadcasting(true);
    try {
      await onSaveSettings({
        ...settings,
        announcement: noticeText.trim(),
        announcementActive: isActive,
      });

      const newNotice = {
        id: `not-${Date.now()}`,
        text: noticeText.trim(),
        active: isActive,
        date: 'এইমাত্র ব্রডকাস্ট',
        priority: 'high' as const,
      };

      setNoticesList([newNotice, ...noticesList]);
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (err: any) {
      alert(`Broadcast failed: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    setNoticesList(noticesList.filter((n) => n.id !== id));
    if (noticesList.length <= 1) {
      await onSaveSettings({
        ...settings,
        announcement: '',
        announcementActive: false,
      });
      setNoticeText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            <span>নোটিশ ও ব্রডকাস্ট বার্তা (Notices)</span>
          </h1>
          <p className="text-xs text-zinc-400">
            ওয়েবসাইটের টপ ব্যানার এবং ইউজার প্যানেলের নোটিফিকেশন বারে রিয়েল-টাইমে নোটিশ পাঠান।
          </p>
        </div>

        {broadcastSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>নোটিশ সফলভাবে ব্রডকাস্ট করা হয়েছে!</span>
          </div>
        )}
      </div>

      {/* Broadcast Form */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
          <span>নতুন ঘোষণা বা ব্রডকাস্ট বার্তা লিখুন</span>
        </h2>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              নোটিশ বার্তা (Notice Content)
            </label>
            <textarea
              rows={3}
              required
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="যেমন: 📢 প্রিয় ব্যবহারকারীগণ, আমাদের MEGA এবং Google Drive সার্ভার সফলভাবে আপডেট করা হয়েছে। শুভ স্ট্রিমিং!"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span>সরাসরি ওয়েবসাইটে সচল (Active) রাখুন</span>
            </label>

            {/* Yellow / Orange Broadcast Button */}
            <button
              type="submit"
              disabled={isBroadcasting || !noticeText.trim()}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/60 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4 fill-black" />
              <span>{isBroadcasting ? 'ব্রডকাস্ট হচ্ছে...' : 'নোটিশ ব্রডকাস্ট করুন'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Notices List */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>সচল নোটিশসমূহের রিয়েল-টাইম তালিকা</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {noticesList.length} Active Notices
          </span>
        </h2>

        <div className="space-y-3">
          {noticesList.map((notice, idx) => (
            <div
              key={`admin-notice-${notice.id || idx}`}
              className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-zinc-700 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-white font-medium leading-relaxed">{notice.text}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1">
                    <span>{notice.date}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">সচল (Active)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleDeleteNotice(notice.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>মুছে ফেলুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
