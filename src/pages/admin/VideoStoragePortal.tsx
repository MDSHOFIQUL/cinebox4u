import React, { useState } from 'react';
import {
  HardDrive,
  Plus,
  ExternalLink,
  Copy,
  Trash2,
  Check,
  Sparkles,
  CheckCircle2,
  Download,
  Film,
  Zap,
} from 'lucide-react';
import { VideoQuality } from '../../types';

interface StoredVideo {
  id: string;
  title: string;
  provider: 'direct' | 'mega' | 'gdrive';
  resolution: VideoQuality;
  shareUrl: string;
  createdAt: string;
}

export const VideoStoragePortal: React.FC = () => {
  const [storedVideos, setStoredVideos] = useState<StoredVideo[]>(() => {
    try {
      const saved = localStorage.getItem('cinebox4u_stored_videos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'sv-1',
        title: 'Oppenheimer (2023) Master Remux',
        provider: 'mega',
        resolution: '1080p',
        shareUrl: 'https://mega.nz/file/CineBox4u_Oppenheimer_1080p_Stream',
        createdAt: new Date().toLocaleDateString(),
      },
      {
        id: 'sv-2',
        title: 'Interstellar (2014) IMAX Edition',
        provider: 'gdrive',
        resolution: '4K',
        shareUrl: 'https://drive.google.com/file/d/1CineBox4u_Interstellar_4k_hdr/view',
        createdAt: new Date().toLocaleDateString(),
      },
      {
        id: 'sv-3',
        title: 'Avatar: The Way of Water',
        provider: 'direct',
        resolution: '1080p',
        shareUrl: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
        createdAt: new Date().toLocaleDateString(),
      },
      {
        id: 'sv-4',
        title: 'Sardar (2022) Spy Action Thriller',
        provider: 'direct',
        resolution: '720p',
        shareUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
        createdAt: new Date().toLocaleDateString(),
      },
    ];
  });

  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState<'direct' | 'mega' | 'gdrive'>('direct');
  const [resolution, setResolution] = useState<VideoQuality>('1080p');
  const [shareUrl, setShareUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const quickMovieChips = [
    'Avatar',
    'Sardar',
    'Oppenheimer',
    'Interstellar',
    'Dune',
    'Inception',
    'The Cyberpunk Protocol',
    'Tokyo Midnight Velocity',
    'হাওয়া (Hawa)',
  ];

  const saveVideosList = (updated: StoredVideo[]) => {
    setStoredVideos(updated);
    try {
      localStorage.setItem('cinebox4u_stored_videos', JSON.stringify(updated));
    } catch {}
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shareUrl.trim()) return;

    const newVideo: StoredVideo = {
      id: `sv-${Date.now()}`,
      title: title.trim(),
      provider,
      resolution,
      shareUrl: shareUrl.trim(),
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [newVideo, ...storedVideos];
    saveVideosList(updated);
    setTitle('');
    setShareUrl('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Are you sure you want to remove this video link from storage?')) {
      const updated = storedVideos.filter((v) => v.id !== id);
      saveVideosList(updated);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleTriggerDownload = (video: StoredVideo) => {
    let target = video.shareUrl;
    if (video.provider === 'gdrive') {
      const match = video.shareUrl.match(/[-\w]{25,}/);
      if (match) {
        target = `https://drive.google.com/uc?export=download&id=${match[0]}&confirm=t`;
      }
    }

    try {
      const anchor = document.createElement('a');
      anchor.href = target;
      const clean = video.title.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
      anchor.download = `CineBox4u_${clean}_${video.resolution}.mp4`;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      window.open(target, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-red-500" />
            <span>ভিডিও স্টোরেজ পোর্টাল (Video Storage Portal)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Direct Stream, MEGA এবং Google Drive ক্লাউড লিংক সংরক্ষণ ও মুভি পেজে অটো-সিঙ্ক ব্যবস্থাপনা
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>ভিডিও লিংক সফলভাবে সংরক্ষণ ও অটো-কানেক্ট হয়েছে!</span>
          </div>
        )}
      </div>

      {/* Add Stored Video Form */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>অনুমোদিত শেয়ার লিংক ফরম (Add Video Storage Link)</span>
          </h2>
          <span className="text-[10px] text-zinc-400 font-mono">AUTO-LINK TO MOVIES</span>
        </div>

        {/* Quick Movie Chips */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
            মুভি সিলেক্ট করার জন্য দ্রুত কুইক-চিপস (১-ক্লিকে নাম বসান):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickMovieChips.map((chip) => (
              <button
                type="button"
                key={chip}
                onClick={() => setTitle(chip)}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-red-600/30 border border-zinc-800 hover:border-red-500 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSaveVideo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Video Title */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                ভিডিওর নাম (Video Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: Avatar বা Sardar বা Dune: Part Two"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
              />
            </div>

            {/* Share URL */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                শেয়ার / স্ট্রিম লিংক (Share or Direct MP4 URL) *
              </label>
              <input
                type="url"
                required
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
                placeholder="https://...mp4 বা https://mega.nz/... বা https://drive.google.com/..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Server Provider Chips */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                সার্ভার প্রোভাইডার (Server Provider)
              </label>
              <div className="flex items-center gap-2">
                {/* Direct Stream Chip */}
                <button
                  type="button"
                  onClick={() => setProvider('direct')}
                  className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    provider === 'direct'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Direct Stream</span>
                </button>

                {/* MEGA Chip */}
                <button
                  type="button"
                  onClick={() => setProvider('mega')}
                  className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    provider === 'mega'
                      ? 'bg-red-600 text-white border-red-500 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 rounded bg-white text-red-600 font-black text-[10px] flex items-center justify-center">
                    M
                  </span>
                  <span>MEGA ক্লাউড</span>
                </button>

                {/* Google Drive Chip */}
                <button
                  type="button"
                  onClick={() => setProvider('gdrive')}
                  className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    provider === 'gdrive'
                      ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 rounded bg-white text-sky-600 font-black text-[10px] flex items-center justify-center">
                    GD
                  </span>
                  <span>Google Drive</span>
                </button>
              </div>
            </div>

            {/* Resolution Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                রেজোলিউশন (Resolution)
              </label>
              <div className="flex items-center gap-1.5">
                {(['360p', '480p', '720p', '1080p', '4K'] as VideoQuality[]).map((res) => (
                  <button
                    type="button"
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      resolution === res
                        ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/60 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ভিডিও লিংক সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* Stored Video Management */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>সংরক্ষিত ভিডিও তালিকা (Stored Videos)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
            {storedVideos.length} Links Saved
          </span>
        </h2>

        <div className="space-y-3">
          {storedVideos.map((video) => (
            <div
              key={video.id}
              className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:border-zinc-700 transition"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 mt-0.5 ${
                    video.provider === 'mega'
                      ? 'bg-red-600'
                      : video.provider === 'gdrive'
                      ? 'bg-sky-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {video.provider === 'mega' ? 'M' : video.provider === 'gdrive' ? 'GD' : 'DIR'}
                </div>
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <span>{video.title}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">
                      {video.resolution}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono truncate max-w-sm sm:max-w-md mt-0.5">
                    {video.shareUrl}
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-1">
                    Saved on {video.createdAt} • Provider: {video.provider.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Play, Download, Copy, Delete */}
              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/80">
                {/* Open / Test Source Link */}
                <button
                  onClick={() => window.open(video.shareUrl, '_blank')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  title="উৎস লিংক খুলুন (Open link in new tab)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>উৎস লিংক</span>
                </button>

                {/* 1-Click Download Button */}
                <button
                  onClick={() => handleTriggerDownload(video)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition shadow"
                  title="১-ক্লিক ডাউনলোড"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={() => handleCopyLink(video.shareUrl, video.id)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                  title="Copy link"
                >
                  {copiedId === video.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-red-600/30 text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 transition cursor-pointer"
                  title="Delete link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
