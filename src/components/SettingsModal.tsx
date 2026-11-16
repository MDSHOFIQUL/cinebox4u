import React, { useState } from 'react';
import {
  X,
  Settings,
  Share2,
  LogIn,
  LogOut,
  UserPlus,
  Globe,
  Bell,
  Shield,
  Copy,
  Check,
  Film,
  HardDrive,
  Monitor,
  Smartphone,
  Tv,
  Bookmark,
  LifeBuoy,
  MessageCircleQuestion,
  Headphones,
  FileCode,
  Download,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShare: () => void;
  onOpenNotices?: () => void;
  onNavigateTab?: (tab: string) => void;
  favoritesCount?: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenShare,
  onOpenNotices,
  onNavigateTab,
  favoritesCount = 0,
}) => {
  const { user, profile, isAdmin, isSuperAdmin, logout, openAuthModal } = useAuth();
  const { language, setLanguage, t } = useLocale();

  const [copied, setCopied] = useState(false);
  const [preferredQuality, setPreferredQuality] = useState('1080p');
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getDeviceIcon = () => {
    if (typeof window === 'undefined') return <Monitor className="w-4 h-4" />;
    const ua = navigator.userAgent;
    if (/android|iphone|ipad|mobile/i.test(ua)) return <Smartphone className="w-4 h-4 text-emerald-400" />;
    if (/smart-tv|googletv|appletv|tizen/i.test(ua)) return <Tv className="w-4 h-4 text-purple-400" />;
    return <Monitor className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0e0f14] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>সেটিংস ও কন্ট্রোল প্যানেল</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-mono">
                  SETTINGS
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">অ্যাকাউন্ট, শেয়ার, প্লেব্যাক ও ভাষা কনফিগারেশন</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Authentication & User Credentials */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>অ্যাকাউন্ট ও লগইন স্ট্যাটাস</span>
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                {getDeviceIcon()}
                <span>{/mobile/i.test(navigator.userAgent) ? 'মোবাইল ডিভাইস' : 'কম্পিউটার'}</span>
              </div>
            </div>

            {user ? (
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-zinc-950/90 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user.displayName || 'User'}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">
                        {user.displayName || 'CineBox Viewer'}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate max-w-[180px] sm:max-w-xs">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase">
                    {profile?.role || (isAdmin ? 'Admin' : 'Active User')}
                  </span>
                </div>

                {/* Login & Logout Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      logout();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>লগ আউট (Sign Out)</span>
                  </button>

                  <button
                    onClick={() => {
                      openAuthModal('login');
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    <span>অন্য অ্যাকাউন্টে লগইন</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  আপনার ওয়াচলিস্ট ও স্ট্রিমিং হিস্টোরি ক্লাউডে সিঙ্ক রাখতে লগ ইন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।
                </p>

                {/* Both Login & Register Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      openAuthModal('login');
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/60"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>লগ ইন করুন (Sign In)</span>
                  </button>

                  <button
                    onClick={() => {
                      openAuthModal('register');
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span>নতুন অ্যাকাউন্ট খুলুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Save Option (সংরক্ষিত / ওয়াচলিস্ট) */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-red-500 fill-red-500/20" />
                <span>সেভ অপশন / সংরক্ষিত তালিকা (Save Option)</span>
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {favoritesCount} Saved
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              আপনার পছন্দের সেভ করা সকল মুভি ও সিরিজের ব্যক্তিগত তালিকা এক ক্লিকে ম্যানেজ করুন।
            </p>

            <button
              onClick={() => {
                onClose();
                if (onNavigateTab) onNavigateTab('profile-favorites');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-950/60"
            >
              <Bookmark className="w-4 h-4 fill-white" />
              <span>আমার সংরক্ষিত তালিকা দেখুন (Open Saved Watchlist)</span>
            </button>
          </div>





          {/* Section 3: Share Option (শেয়ার অপশন) */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>শেয়ার অপশন (Share Option)</span>
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                100% Free
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              বন্ধুদের সাথে CineBox4u স্ট্রিমিং ও ডাউনলোড পোর্টাল হোয়াটসঅ্যাপ, টেলিগ্রাম বা যেকোনো মাধ্যমে এক ক্লিকে শেয়ার করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenShare();
                }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Share2 className="w-4 h-4 fill-black" />
                <span>শেয়ার পপআপ খুলুন</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                <span>{copied ? '✓ লিংক কপি হয়েছে!' : 'ডিরেক্ট লিংক কপি করুন'}</span>
              </button>
            </div>
          </div>

          {/* Section 4: Help Desk (হেল্প ডেস্ক ও কাস্টমার সাপোর্ট) */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Headphones className="w-4 h-4 text-blue-400" />
                <span>হেল্প ডেস্ক (Help Desk & Support)</span>
              </span>
              <span className="text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40 font-bold">
                ২৪/৭ সহায়তা
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              কোনো মুভি রিকোয়েস্ট, ডাউনলোড সমস্যা বা যেকোনো টেকনিক্যাল জিজ্ঞাসার জন্য সরাসরি আমাদের হেল্প ডেস্কে টিকেট জমা দিন।
            </p>

            <button
              onClick={() => {
                onClose();
                if (onNavigateTab) onNavigateTab('support');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4 text-blue-400" />
              <span>হেল্প ডেস্ক সাপোর্ট সেন্টার খুলুন (Open Help Desk)</span>
            </button>
          </div>

          {/* Section 5: Language & Quality Preferences */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-500" />
              <span>ভাষা ও ডাউনলোড অগ্রাধিকার</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  ডিসপ্লে ভাষা (Language)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setLanguage('bn')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      language === 'bn'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    🇧🇩 বাংলা
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      language === 'en'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    🌐 English
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  ডিফল্ট ডাউনলোড কোয়ালিটি
                </label>
                <select
                  value={preferredQuality}
                  onChange={(e) => setPreferredQuality(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500 cursor-pointer"
                >
                  <option value="1080p">1080p Full HD (সুপার ক্লিয়ার ~1.8GB)</option>
                  <option value="720p">720p HD (প্রস্তাবিত ~950MB)</option>
                  <option value="480p">480p SD (দ্রুত ডাউনলোড ~480MB)</option>
                  <option value="360p">360p Mobile (ডাটা সেভার ~240MB)</option>
                  <option value="4K">4K Ultra HD (আল্ট্রা ক্রিস্টাল ~4.2GB)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Notice Board & Cloud Servers */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>নোটিশ ও সার্ভার নোটিফিকেশন</span>
              </span>
              {onOpenNotices && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenNotices();
                  }}
                  className="text-xs text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  নোটিশ বোর্ড খুলুন →
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <HardDrive className="w-4 h-4 text-red-500" />
                <span>MEGA ও Google Drive সার্ভার সাপোর্ট</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                সক্রিয় (Active)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-red-500" />
            <span className="text-xs font-extrabold text-white">
              CINE<span className="text-red-500">BOX</span>4U
            </span>
            <span className="text-[10px] text-zinc-500">v2.5 Pro</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
