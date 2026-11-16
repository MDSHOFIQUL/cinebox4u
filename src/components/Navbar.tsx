import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Search,
  Bookmark,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Clock,
  Sparkles,
  ChevronDown,
  Flame,
  Globe,
  Users,
  Calendar,
  LifeBuoy,
  Baby,
  Share2,
  Bell,
  Layers,
  Settings,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useProfile } from '../context/ProfileContext';
import { ProfileSwitcherModal } from './ProfileSwitcherModal';
import { ShareModal } from './ShareModal';
import { CategoryLanguageModal } from './CategoryLanguageModal';
import { SettingsModal } from './SettingsModal';
import { Movie, Series, Category } from '../types';
import { getTabPath } from '../utils/seo';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  movies: Movie[];
  series: Series[];
  favoritesCount: number;
  onOpenDetails: (media: Movie | Series) => void;
  categories?: Category[];
  onSelectCategory?: (slug: string) => void;
  noticesCount?: number;
  onOpenNotices?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  movies,
  series,
  favoritesCount,
  onOpenDetails,
  categories = [],
  onSelectCategory,
  noticesCount = 1,
  onOpenNotices,
}) => {
  const { user, profile, isAdmin, isEditor, logout, openAuthModal } = useAuth();
  const { language, setLanguage, t } = useLocale();
  const { currentProfile } = useProfile();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll listener for translucent frosted glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick live search matching with comprehensive multi-attribute coverage
  const searchResults = searchQuery.trim()
    ? (() => {
        const q = searchQuery.toLowerCase().trim();
        return [
          ...movies.filter((m) => {
            const matchTitle = (m.title || '').toLowerCase().includes(q);
            const matchOrig = (m.originalTitle || '').toLowerCase().includes(q);
            const matchCategory = (m.category || '').toLowerCase().includes(q);
            const matchLanguage = (m.language || '').toLowerCase().includes(q);
            const matchYear = String(m.releaseYear || '').includes(q);
            const matchDirector = (m.director || '').toLowerCase().includes(q);
            const matchCast = m.cast?.some((c) => (c || '').toLowerCase().includes(q));
            const matchGenre = m.genres?.some((g) => (g || '').toLowerCase().includes(q));
            const matchAudio = (m.audioInfo || '').toLowerCase().includes(q);
            return (
              matchTitle ||
              matchOrig ||
              matchCategory ||
              matchLanguage ||
              matchYear ||
              matchDirector ||
              matchCast ||
              matchGenre ||
              matchAudio
            );
          }),
          ...series.filter((s) => {
            const matchTitle = (s.title || '').toLowerCase().includes(q);
            const matchOrig = (s.originalTitle || '').toLowerCase().includes(q);
            const matchCategory = (s.category || '').toLowerCase().includes(q);
            const matchLanguage = (s.language || '').toLowerCase().includes(q);
            const matchYear = String(s.releaseYear || '').includes(q);
            const matchDirector = (s.director || '').toLowerCase().includes(q);
            const matchCast = s.cast?.some((c) => (c || '').toLowerCase().includes(q));
            const matchGenre = s.genres?.some((g) => (g || '').toLowerCase().includes(q));
            return (
              matchTitle ||
              matchOrig ||
              matchCategory ||
              matchLanguage ||
              matchYear ||
              matchDirector ||
              matchCast ||
              matchGenre
            );
          }),
        ].slice(0, 8);
      })()
    : [];

  const navLinks = [
    { id: 'home', label: t('nav_home') },
    { id: 'movies', label: t('nav_movies') },
    { id: 'series', label: t('nav_series') },
    { id: 'dramas', label: t('nav_dramas') },
    { id: 'trending', label: t('nav_trending'), badge: 'HOT' },
    { id: 'latest', label: t('nav_latest') },
    { id: 'calendar', label: t('nav_calendar'), icon: Calendar },
    { id: 'watch-party', label: t('nav_watch_party'), icon: Users, badge: 'SYNC' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0b0c10]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-2xl shadow-black/80'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Mobile Hamburger + Cine FREAK Logo */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Hamburger Button on Left */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-zinc-300 hover:text-white transition cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* CineBox4u Logo */}
              <a
                href="/"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onSelectTab('home');
                  }
                }}
                aria-label="CineBox4u Home"
                className="flex items-center text-left focus:outline-hidden group select-none"
              >
                <div className="flex items-baseline relative">
                  <span className="text-2xl sm:text-3xl font-black italic tracking-tight text-amber-500 font-serif drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
                    Cine
                  </span>
                  <span className="text-2xl sm:text-3xl font-black tracking-wider text-white ml-1">
                    Box
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white bg-gradient-to-r from-red-600 to-amber-600 px-1.5 py-0.5 rounded-md ml-1 shadow-md">
                    4u
                  </span>
                </div>
              </a>

              {/* Desktop Navigation Links */}
              <nav aria-label="Main Navigation" className="hidden xl:flex items-center gap-0.5">
                {navLinks.map((link) => {
                  const isActive = currentTab === link.id;
                  const href = getTabPath(link.id);
                  return (
                    <a
                      key={link.id}
                      href={href}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                          e.preventDefault();
                          onSelectTab(link.id);
                        }
                      }}
                      className={`relative px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'text-white font-bold bg-zinc-800/40'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-red-600/90 text-white rounded-full">
                          {link.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-red-500 rounded-full" />
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Right: Language Switcher, Search, Watchlist, Profile, Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher (EN / BN) */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition"
                title={t('switch_language')}
              >
                <Globe className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
              </button>

              {/* Live Search Input with Instant Dropdown */}
              <div ref={searchRef} className="relative hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('nav_search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        onSelectTab(`search:${searchQuery}`);
                        setSearchFocused(false);
                      }
                    }}
                    className="w-48 lg:w-64 bg-zinc-900/90 border border-zinc-700/80 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                </div>

                {/* Instant Search Results Dropdown */}
                {searchFocused && searchResults.length > 0 && (
                  <div className="absolute right-0 top-11 w-80 bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
                    <div className="text-[10px] uppercase font-bold text-zinc-400 px-3 py-1 border-b border-zinc-800/80 flex items-center justify-between">
                      <span>Quick Results</span>
                      <button
                        onClick={() => {
                          onSelectTab(`search:${searchQuery}`);
                          setSearchFocused(false);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onOpenDetails(item);
                            setSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition text-left"
                        >
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-9 h-12 rounded object-cover shrink-0"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                              <span className="uppercase text-red-400 font-bold">{item.type}</span>
                              <span>•</span>
                              <span>{item.releaseYear}</span>
                              <span>•</span>
                              <span className="text-amber-400 font-bold">★ {item.rating}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category & Language Selector Modal Trigger */}
              <button
                onClick={() => setCategoryModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white hover:border-red-500/50 transition cursor-pointer"
                title="ক্যাটাগরি ও ভাষা নির্বাচন (Category & Language)"
              >
                <Layers className="w-3.5 h-3.5 text-red-500" />
                <span>ক্যাটাগরি ও ভাষা</span>
              </button>

              {/* Notice Bell Icon with Pink 32 Counter Badge (Exact Cine FREAK screenshot match) */}
              <button
                onClick={() => {
                  if (onOpenNotices) onOpenNotices();
                  else onSelectTab('home');
                }}
                className="relative p-2 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800/60 rounded-xl transition cursor-pointer"
                title="রিয়েল-টাইম নোটিশ ও আপডেট"
              >
                <Bell className="w-5 h-5 text-zinc-300" />
                <span className="absolute -top-1 -right-1 bg-[#e11d48] text-white text-[10px] font-black rounded-full px-1.5 py-0.2 min-w-5 h-4 flex items-center justify-center shadow-lg border border-pink-400/30">
                  32
                </span>
              </button>

              {/* Mobile Search Button */}
              <button
                onClick={() => onSelectTab('search')}
                className="p-2 text-zinc-300 hover:text-white cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Settings Modal Button */}
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-xl transition cursor-pointer"
                title="সেটিংস ও অপশন (Settings & Options)"
              >
                <Settings className="w-5 h-5 text-zinc-300 hover:text-white" />
              </button>


              {/* Admin Portal Shortcut Button - STRICTLY HIDDEN UNLESS LOGGED IN AS ADMIN */}
              {user && (isAdmin || user.email?.toLowerCase() === 'imdshofiqul863@gmail.com') && (
                <button
                  onClick={() => onSelectTab('admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600 hover:text-white"
                  title="CineBox4u Admin Portal"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* Direct Outside Logout / Login Buttons */}
              {user && (
                <button
                  onClick={() => logout()}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-xs font-bold transition cursor-pointer shadow-sm"
                  title="লগ আউট করুন (Sign Out)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              )}

              {/* Profile / Auth Area */}
              {user ? (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-red-500/50 transition focus:outline-hidden"
                  >
                    <div className="relative">
                      <img
                        src={currentProfile?.avatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={currentProfile?.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                      />
                      {currentProfile?.isKids && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] font-black px-1 rounded-full shadow">
                          KID
                        </div>
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-11 w-60 bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
                      <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">
                            {currentProfile?.name || user.displayName || 'CineBox Viewer'}
                          </p>
                          {currentProfile?.isKids && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                              KIDS
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                        <div className="mt-1">
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                            {profile?.role || 'User'}
                          </span>
                        </div>
                      </div>

                      {/* Switch Profile Button */}
                      <button
                        onClick={() => {
                          setProfileModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3.5 h-3.5 text-red-400" />
                          <span>{t('nav_switch_profile')}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 transition"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                        {t('nav_watchlist')}
                      </button>

                      <button
                        onClick={() => {
                          onSelectTab('profile-history');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 transition"
                      >
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        Watch History
                      </button>

                      {(isAdmin || user?.email?.toLowerCase() === 'imdshofiqul863@gmail.com') && (
                        <button
                          onClick={() => {
                            onSelectTab('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {t('nav_admin')}
                        </button>
                      )}

                      <div className="border-t border-zinc-800 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800 flex items-center gap-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('nav_sign_out')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-900/30 transition-transform duration-150 hover:scale-105 active:scale-95"
                >
                  {t('nav_sign_in')}
                </button>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-zinc-400 hover:text-white xl:hidden"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-zinc-950/98 border-b border-zinc-800 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder={t('nav_search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSelectTab(`search:${searchQuery}`);
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={getTabPath(link.id)}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onSelectTab(link.id);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold ${
                    currentTab === link.id
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-bold">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              {user && (isAdmin || user.email?.toLowerCase() === 'imdshofiqul863@gmail.com') ? (
                <button
                  onClick={() => {
                    onSelectTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-400 font-bold flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {t('nav_admin')}
                </button>
              ) : (
                <span className="text-[11px] text-zinc-500 font-medium">CineBox4u Free Streaming</span>
              )}

              <button
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="text-xs text-zinc-300 font-bold flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'en' ? 'বাংলা সংস্করণ' : 'English'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Viewing Profile Switcher Modal */}
      <ProfileSwitcherModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Global Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="CineBox4u — Ultimate Super-Fast Streaming Portal"
      />

      {/* Category & Language Selection Modal */}
      <CategoryLanguageModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onSelectCategory={(slug) => {
          if (onSelectCategory) {
            onSelectCategory(slug);
          } else {
            onSelectTab(`movies`);
          }
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onOpenShare={() => setShareModalOpen(true)}
        onOpenNotices={onOpenNotices}
        onNavigateTab={(tab) => {
          onSelectTab(tab);
          setSettingsModalOpen(false);
        }}
        favoritesCount={favoritesCount}
      />
    </>
  );
};
