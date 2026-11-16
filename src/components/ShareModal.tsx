import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageSquare } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
  category?: string;
  posterUrl?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title = 'CineBox4u — Ultimate Super-Fast Streaming Portal',
  url = typeof window !== 'undefined' ? window.location.href : 'https://cinebox4u.netlify.app/',
  category,
  posterUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `🍿 CineBox4u - Ultimate Super-Fast Streaming Portal\n🎬 "${title}" ${category ? `[${category}]` : ''}\n⚡ সুপার ফাস্ট MEGA, Google Drive সার্ভার সাপোর্ট। একদম ফ্রিতে দেখুন ও ১-ক্লিকে ডাউনলোড করুন:\n${url}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleTelegram = () => {
    const encoded = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encoded}`, '_blank');
  };

  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `🍿 CineBox4u: ${title}`,
          url,
        });
      } catch (err) {
        // user cancelled or failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#111218] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-950/60">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">শেয়ার করুন / Share Portal</h3>
            <p className="text-[11px] text-zinc-400">বন্ধুদের সাথে এক ক্লিকে শেয়ার করুন</p>
          </div>
        </div>

        {/* Media Preview Card */}
        <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800/80 mb-5 flex items-center gap-3">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-12 h-16 object-cover rounded-xl shrink-0 border border-zinc-700/60"
            />
          ) : (
            <div className="w-12 h-16 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
              <Share2 className="w-6 h-6 text-red-500" />
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white line-clamp-1">{title}</p>
            {category && (
              <span className="inline-block mt-0.5 text-[10px] font-semibold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-md border border-red-800/40">
                {category}
              </span>
            )}
            <p className="text-[10px] text-zinc-500 truncate mt-1">{url}</p>
          </div>
        </div>

        {/* Share Action Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0f291e] hover:bg-[#153b2b] border border-emerald-500/40 text-emerald-300 font-bold text-xs transition group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
              <MessageSquare className="w-4 h-4 fill-white" />
            </div>
            <div className="text-left">
              <span className="block text-white text-xs">WhatsApp</span>
              <span className="text-[10px] text-emerald-400 font-normal">ইনস্ট্যান্ট চ্যাট</span>
            </div>
          </button>

          {/* Telegram */}
          <button
            onClick={handleTelegram}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0e2438] hover:bg-[#14324f] border border-sky-500/40 text-sky-300 font-bold text-xs transition group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
              <Send className="w-4 h-4 fill-white" />
            </div>
            <div className="text-left">
              <span className="block text-white text-xs">Telegram</span>
              <span className="text-[10px] text-sky-400 font-normal">গ্রুপ ও চ্যানেল</span>
            </div>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs transition group shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition ${copied ? 'bg-emerald-600' : 'bg-red-600'}`}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </div>
            <div className="text-left">
              <span className="block text-white text-xs">{copied ? 'কপি হয়েছে!' : 'লিংক কপি'}</span>
              <span className="text-[10px] text-zinc-400 font-normal">{copied ? 'Copied to clipboard' : 'Direct Link'}</span>
            </div>
          </button>

          {/* System Native Share */}
          <button
            onClick={handleSystemShare}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs transition group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-white text-xs">Device Share</span>
              <span className="text-[10px] text-zinc-400 font-normal">মোবাইল / ব্লুটুথ</span>
            </div>
          </button>
        </div>

        {/* Copy input display */}
        <div className="flex items-center gap-2 p-2 bg-zinc-950 rounded-xl border border-zinc-800">
          <input
            type="text"
            readOnly
            value={url}
            className="bg-transparent text-[11px] text-zinc-400 flex-1 px-2 focus:outline-hidden"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
