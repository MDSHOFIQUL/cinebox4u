import React from 'react';
import { Film, Shield, Heart, Send, Twitter, Disc as Discord, Sparkles } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  isAdmin?: boolean;
  telegramUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, isAdmin = false, telegramUrl }) => {
  return (
    <footer className="bg-[#07080b] border-t border-zinc-800/80 text-zinc-400 text-xs mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800/60">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-950/40">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                CINE<span className="text-red-500">BOX</span>
                <span className="ml-1 px-1.5 py-0.5 bg-red-600 text-white text-[11px] font-black rounded-md">
                  4U
                </span>
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              Your premier cinematic streaming experience with adaptive multi-server HLS streaming,
              instant resume points, multi-language subtitles, and an ultra-fast dark theater interface.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:text-white flex items-center justify-center transition"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:text-white flex items-center justify-center transition"
                aria-label="Discord"
              >
                <Discord className="w-4 h-4" />
              </a>
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:text-white flex items-center justify-center transition"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider">Explore Content</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/movies"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('movies');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  Movies Catalog
                </a>
              </li>
              <li>
                <a
                  href="/series"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('series');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  Web Series &amp; Seasons
                </a>
              </li>
              <li>
                <a
                  href="/dramas"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('dramas');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  K-Dramas &amp; Asian Dramas
                </a>
              </li>
              <li>
                <a
                  href="/trending"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('trending');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  Trending Top 10
                </a>
              </li>
              <li>
                <a
                  href="/latest"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('latest');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  Latest Releases
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider">Genres</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/search?q=Sci-Fi"
                  rel="nofollow"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('search:Sci-Fi');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  Sci-Fi &amp; Cyberpunk
                </a>
              </li>
              <li>
                <a
                  href="/search?q=Action"
                  rel="nofollow"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('search:Action');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  Action &amp; Thrillers
                </a>
              </li>
              <li>
                <a
                  href="/search?q=Drama"
                  rel="nofollow"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('search:Drama');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  Romantic Dramas
                </a>
              </li>
              <li>
                <a
                  href="/search?q=Animation"
                  rel="nofollow"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('search:Animation');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  Animation &amp; Anime
                </a>
              </li>
              <li>
                <a
                  href="/search?q=Crime"
                  rel="nofollow"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab('search:Crime');
                    }
                  }}
                  className="hover:text-red-400 transition cursor-pointer"
                >
                  Crime &amp; Mystery
                </a>
              </li>
            </ul>
          </div>

          {/* System & Platform Infrastructure */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider">
              {isAdmin ? 'Platform & Admin' : 'স্ট্রিমিং প্রযুক্তি'}
            </h4>
            <ul className="space-y-2">
              {isAdmin && (
                <li>
                  <button
                    onClick={() => onSelectTab('admin')}
                    className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Dashboard
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onSelectTab('profile')} className="hover:text-white transition cursor-pointer">
                  User Watchlist & History
                </button>
              </li>
              <li>
                <span className="text-zinc-500">Firebase Firestore Cloud Sync</span>
              </li>
              <li>
                <span className="text-zinc-500">Cloud Run Production Ready</span>
              </li>
              <li>
                <span className="text-zinc-500">HLS Adaptive Streaming</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer with discrete admin access */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p className="flex items-center gap-1">
            <span>© 2026 CineBox4u Streaming Platform. All rights reserved.</span>
            {/* Subtle administrative access toggle for the admin */}
            <button
              onClick={() => {
                if (window.location.hash !== '#admin') {
                  window.location.hash = '#admin';
                }
                onSelectTab('admin');
              }}
              className="opacity-0 hover:opacity-40 transition ml-1 text-zinc-600 cursor-pointer"
              title="Secure Terminal"
              aria-label="Secure Terminal"
            >
              <Shield className="w-3 h-3 inline" />
            </button>
          </p>
          <p className="max-w-xl text-center md:text-right">
            Disclaimer: CineBox4u delivers high-definition streams via authorized open media test servers and user-configured sources. No unauthorized copyright content is hosted on local servers.
          </p>
        </div>
      </div>
    </footer>
  );
};
