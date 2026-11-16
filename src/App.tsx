import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocaleProvider } from './context/LocaleContext';
import { ProfileProvider } from './context/ProfileContext';
import { ViewModeProvider } from './context/ViewModeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { MovieDetailsView } from './components/MovieDetailsView';
import { CastProfileModal } from './components/CastProfileModal';
import { FranchiseModal, FranchiseCollection } from './components/FranchiseModal';
import { NoticeBoardModal } from './components/NoticeBoardModal';
import { ShareModal } from './components/ShareModal';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { SeriesPage } from './pages/SeriesPage';
import { DramasPage } from './pages/DramasPage';
import { TrendingPage } from './pages/TrendingPage';
import { LatestReleasesPage } from './pages/LatestReleasesPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { WatchPage } from './pages/WatchPage';
import { CalendarPage } from './pages/CalendarPage';
import { WatchPartyPage } from './pages/WatchPartyPage';
import { SupportPage } from './pages/SupportPage';
import { AdminPortal } from './pages/admin/AdminPortal';
import {
  Movie,
  Series,
  Episode,
  Category,
  Language,
  SiteSettings,
  WatchHistoryItem,
  FavoriteItem,
  UserProfile,
  AdminLog,
} from './types';
import {
  getCachedCatalog,
  subscribeMovies,
  subscribeSeries,
  subscribeSettings,
  fetchMovies,
  fetchSeries,
  fetchEpisodes,
  fetchCategories,
  fetchLanguages,
  fetchSettings,
  fetchUserWatchHistory,
  fetchUserFavorites,
  saveWatchProgress,
  removeWatchHistoryItem,
  toggleFavorite,
  saveMovie,
  deleteMovie,
  saveSeries,
  deleteSeries,
  saveEpisode,
  deleteEpisode,
  saveCategory,
  deleteCategory,
  saveLanguage,
  deleteLanguage,
  updateSettings,
  fetchAllUsers,
  updateUserRoleOrStatus,
  fetchAdminLogs,
  seedInitialFirestoreData,
} from './services/dataService';
import {
  INITIAL_MOVIES,
  INITIAL_SERIES,
  INITIAL_EPISODES,
  INITIAL_CATEGORIES,
  INITIAL_LANGUAGES,
  INITIAL_SETTINGS,
} from './data/initialData';
import { Bell, AlertTriangle, Shield, Film, Wrench } from 'lucide-react';
import { SeoHead } from './components/SeoHead';
import { getMediaDetailPath, getTabPath, parseRouteFromLocation, slugify } from './utils/seo';

const MainApp: React.FC = () => {
  const { user, profile, isAdmin, isEditor, role } = useAuth();

  const initialRoute = React.useMemo(
    () =>
      typeof window !== 'undefined'
        ? parseRouteFromLocation(window.location.pathname, window.location.hash, window.location.search)
        : { tab: 'home', categorySlug: '', mediaId: null, mediaType: null, searchQuery: '', isLegacyHash: false },
    []
  );

  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<string>(initialRoute.tab);
  const [searchParam, setSearchParam] = useState<string>(initialRoute.searchQuery);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(initialRoute.categorySlug);

  // Modals & Active playback
  const [activeMedia, setActiveMedia] = useState<Movie | Series | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | undefined>(undefined);
  const [detailsItem, setDetailsItem] = useState<Movie | Series | null>(null);
  const [activePerson, setActivePerson] = useState<{ name: string; role: 'actor' | 'director' } | null>(null);
  const [activeFranchise, setActiveFranchise] = useState<FranchiseCollection | null>(null);

  // Catalog Data — Hydrated synchronously at 0ms from cached Firebase data (no loading wait)
  const initialCatalog = React.useMemo(() => getCachedCatalog(), []);
  const [movies, setMovies] = useState<Movie[]>(initialCatalog.movies);
  const [series, setSeries] = useState<Series[]>(initialCatalog.series);
  const [episodes, setEpisodes] = useState<Episode[]>(initialCatalog.episodes);
  const [categories, setCategories] = useState<Category[]>(initialCatalog.categories);
  const [languages, setLanguages] = useState<Language[]>(initialCatalog.languages);
  const [settings, setSettings] = useState<SiteSettings>(initialCatalog.settings);

  // User-specific data
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Admin Data
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [floatingShareOpen, setFloatingShareOpen] = useState(false);

  const rawTelegramUrl = (settings.contactTelegram || settings.socialLinks?.telegram || '').trim();
  const telegramChannelUrl = (() => {
    if (!rawTelegramUrl) return '';
    const cleaned = rawTelegramUrl.startsWith('@')
      ? `https://t.me/${rawTelegramUrl.slice(1)}`
      : rawTelegramUrl.startsWith('t.me/')
      ? `https://${rawTelegramUrl}`
      : rawTelegramUrl;
    if (cleaned === 'https://t.me/cinebox4u' || cleaned === 'https://t.me') {
      return '';
    }
    return cleaned;
  })();

  // Load Catalog on Mount with Non-Blocking Parallel Sync + Real-time Firestore Listeners
  useEffect(() => {
    fetchMovies().then((m) => { if (m && m.length > 0) setMovies(m); }).catch(() => {});
    fetchSeries().then((s) => { if (s && s.length > 0) setSeries(s); }).catch(() => {});
    fetchEpisodes().then((e) => { if (e && e.length > 0) setEpisodes(e); }).catch(() => {});
    fetchCategories().then((c) => { if (c && c.length > 0) setCategories(c); }).catch(() => {});
    fetchLanguages().then((l) => { if (l && l.length > 0) setLanguages(l); }).catch(() => {});
    fetchSettings().then((set) => { if (set) setSettings(set); }).catch(() => {});

    // Attach live listeners so any additions in Firebase console or Admin Portal sync instantly
    const unsubMovies = subscribeMovies((freshMovies) => {
      if (freshMovies && freshMovies.length > 0) {
        setMovies(freshMovies);
      }
    });
    const unsubSeries = subscribeSeries((freshSeries) => {
      if (freshSeries && freshSeries.length > 0) {
        setSeries(freshSeries);
      }
    });
    const unsubSettings = subscribeSettings((freshSettings) => {
      if (freshSettings) {
        setSettings(freshSettings);
      }
    });

    return () => {
      unsubMovies();
      unsubSeries();
      unsubSettings();
    };
  }, []);

  // Load User Data (Watchlist & History) when User Changes
  useEffect(() => {
    if (user?.uid) {
      fetchUserWatchHistory(user.uid).then(setWatchHistory).catch(() => {});
      fetchUserFavorites(user.uid).then(setFavorites).catch(() => {});
    } else {
      setWatchHistory([]);
      setFavorites([]);
    }
  }, [user?.uid]);

  // Load Admin Data if Admin/Editor
  useEffect(() => {
    if (isAdmin || isEditor) {
      fetchAllUsers().then(setAllUsers).catch(() => {});
      fetchAdminLogs().then(setAdminLogs).catch(() => {});
    }
  }, [isAdmin, isEditor, currentTab]);

  // Track scroll position before opening a movie details page so Back restores it cleanly
  const savedScrollYRef = React.useRef<number>(0);

  // Keep open details item synced with live Firestore movies/series updates
  const liveDetailsItem = React.useMemo(() => {
    if (!detailsItem) return null;
    if (detailsItem.type === 'movie') {
      return movies.find((m) => m.id === detailsItem.id) || detailsItem;
    }
    return series.find((s) => s.id === detailsItem.id) || detailsItem;
  }, [detailsItem, movies, series]);

  // Clean History API Path Routing + Legacy Hash (#movie/:id, #admin) Compatibility
  useEffect(() => {
    const syncFromLocation = () => {
      const route = parseRouteFromLocation(
        window.location.pathname,
        window.location.hash,
        window.location.search
      );

      if (route.mediaId) {
        const rawId = route.mediaId;
        const rawSlug = slugify(rawId);
        const searchPool =
          route.mediaType === 'series'
            ? [...series, ...movies]
            : [...movies, ...series];
        const matched = searchPool.find(
          (item) =>
            item.id === rawId ||
            (rawSlug && slugify(item.title) === rawSlug)
        );
        if (matched) {
          setDetailsItem(matched);
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
        return;
      }

      setDetailsItem(null);
      setCurrentTab(route.tab);
      setSearchParam(route.searchQuery);
      setSelectedCategorySlug(route.categorySlug);

      requestAnimationFrame(() => {
        if (savedScrollYRef.current > 0) {
          window.scrollTo({ top: savedScrollYRef.current, behavior: 'auto' });
        }
      });
    };

    syncFromLocation();
    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, [movies, series]);

  const updateBrowserUrl = (targetPath: string, replace = false) => {
    const currentFull = window.location.pathname + window.location.search + window.location.hash;
    if (currentFull !== targetPath) {
      if (replace) {
        window.history.replaceState(null, '', targetPath);
      } else {
        window.history.pushState(null, '', targetPath);
      }
    }
  };

  // Open Dynamic Movie/Series Details Page with Clean Path & History Push
  const handleOpenDetails = (item: Movie | Series) => {
    if (!detailsItem) {
      savedScrollYRef.current = window.scrollY;
    }
    setActivePerson(null);
    setActiveFranchise(null);
    setDetailsItem(item);
    updateBrowserUrl(getMediaDetailPath(item));
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleCloseDetails = () => {
    const isDetailPath =
      window.location.pathname.startsWith('/movie/') ||
      window.location.pathname.startsWith('/series/') ||
      window.location.hash.startsWith('#movie/');

    if (isDetailPath && window.history.length > 1) {
      window.history.back();
      return;
    }
    setDetailsItem(null);
    updateBrowserUrl(getTabPath(currentTab, selectedCategorySlug), true);
  };

  // Handle Tab Selection
  const handleSelectTab = (tab: string) => {
    setDetailsItem(null);
    savedScrollYRef.current = 0;
    if (tab.startsWith('search:')) {
      const q = tab.slice('search:'.length);
      setSearchParam(q);
      setSelectedCategorySlug('');
      setCurrentTab('search');
      updateBrowserUrl(getTabPath(tab));
    } else {
      setSearchParam('');
      if (tab === 'movies') {
        setSelectedCategorySlug('all');
        updateBrowserUrl(getTabPath('movies', 'all'));
      } else {
        setSelectedCategorySlug('');
        updateBrowserUrl(getTabPath(tab));
      }
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleSelectCategoryRoute = (slug: string) => {
    setDetailsItem(null);
    savedScrollYRef.current = 0;
    setSearchParam('');
    setSelectedCategorySlug(slug);
    setCurrentTab('movies');
    updateBrowserUrl(getTabPath('movies', slug));
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Playback Handlers
  const handlePlayMedia = (item: Movie | Series, episode?: Episode, serverIndex?: number) => {
    setActiveMedia(item);
    setActiveEpisode(episode);
    setDetailsItem(null);
    setCurrentTab('watch');
    updateBrowserUrl('/watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (item: Movie | Series) => {
    if (!user) {
      alert('Please sign in to save movies and series to your CineBox4u watchlist.');
      return;
    }
    const isFav = favorites.some((f) => f.mediaId === item.id);
    await toggleFavorite(user.uid, {
      mediaId: item.id,
      mediaType: item.type,
      title: item.title,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      rating: item.rating,
      releaseYear: item.releaseYear,
      category: item.category,
    });
    const updated = await fetchUserFavorites(user.uid);
    setFavorites(updated);
  };

  const handleWatchProgress = async (progressSeconds: number, totalSeconds: number, completed: boolean) => {
    if (!user || !activeMedia) return;
    await saveWatchProgress(user.uid, {
      mediaId: activeMedia.id,
      mediaType: activeMedia.type,
      seriesId: activeMedia.type === 'series' ? activeMedia.id : undefined,
      episodeId: activeEpisode?.id,
      seasonNumber: activeEpisode?.seasonNumber,
      episodeNumber: activeEpisode?.episodeNumber,
      title: activeMedia.type === 'movie' ? activeMedia.title : `${activeMedia.title} - ${activeEpisode?.title || ''}`,
      posterUrl: activeEpisode?.thumbnail || activeMedia.posterUrl,
      progressSeconds,
      totalSeconds,
      completed,
      lastWatchedAt: new Date().toISOString(),
    });
  };

  const handleRemoveHistory = async (historyId: string) => {
    if (!user) return;
    await removeWatchHistoryItem(user.uid, historyId);
    setWatchHistory(watchHistory.filter((h) => h.id !== historyId));
  };

  // Admin Mutations
  const handleSaveMovie = async (movie: Movie) => {
    await saveMovie(movie, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    const updated = await fetchMovies();
    setMovies(updated);
  };

  const handleDeleteMovie = async (movieId: string) => {
    await deleteMovie(movieId, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    setMovies(movies.filter((m) => m.id !== movieId));
  };

  const handleSaveSeries = async (ser: Series) => {
    await saveSeries(ser, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    const updated = await fetchSeries();
    setSeries(updated);
  };

  const handleDeleteSeries = async (seriesId: string) => {
    await deleteSeries(seriesId, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    setSeries(series.filter((s) => s.id !== seriesId));
  };

  const handleSaveEpisode = async (ep: Episode) => {
    await saveEpisode(ep, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    const updated = await fetchEpisodes();
    setEpisodes(updated);
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    await deleteEpisode(episodeId, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    setEpisodes(episodes.filter((e) => e.id !== episodeId));
  };

  const handleSaveCategory = async (cat: Category) => {
    await saveCategory(cat, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    const updated = await fetchCategories();
    setCategories(updated);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(categoryId, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    setCategories(categories.filter((c) => c.id !== categoryId));
  };

  const handleSaveLanguage = async (lang: Language) => {
    await saveLanguage(lang, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    const updated = await fetchLanguages();
    setLanguages(updated);
  };

  const handleDeleteLanguage = async (languageId: string) => {
    await deleteLanguage(languageId, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    setLanguages(languages.filter((l) => l.id !== languageId));
  };

  const handleSaveSettings = async (set: SiteSettings) => {
    await updateSettings(set, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    setSettings(set);
  };

  const handleUpdateUser = async (targetUid: string, updates: Partial<UserProfile>) => {
    await updateUserRoleOrStatus(targetUid, updates, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    const updated = await fetchAllUsers();
    setAllUsers(updated);
  };

  const handleImportBulkMovies = async (bulkList: Movie[]) => {
    for (const m of bulkList) {
      await saveMovie(m, user?.uid || 'admin', user?.email || 'admin@cinebox4u.com');
    }
    const updated = await fetchMovies();
    setMovies(updated);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedInitialFirestoreData(user?.uid || 'admin', user?.email || 'imdshofiqul863@gmail.com');
      const [m, s, e, c, l, set, logs] = await Promise.all([
        fetchMovies(),
        fetchSeries(),
        fetchEpisodes(),
        fetchCategories(),
        fetchLanguages(),
        fetchSettings(),
        fetchAdminLogs(),
      ]);
      setMovies(m);
      setSeries(s);
      setEpisodes(e);
      setCategories(c);
      setLanguages(l);
      setSettings(set);
      setAdminLogs(logs);
    } catch (e: any) {
      console.error(e);
      alert(`Seed Error: ${e.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Check Maintenance Mode
  if (settings.maintenanceMode && !isAdmin && !isEditor) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-6 text-white text-center">
        <SeoHead
          currentTab={currentTab}
          selectedCategorySlug={selectedCategorySlug}
          categories={categories}
          searchParam={searchParam}
          detailsItem={null}
          movies={movies}
          series={series}
          settings={settings}
        />
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-500">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black">CineBox4u Scheduled Maintenance</h1>
          <p className="text-xs text-zinc-400">
            Our high-speed streaming infrastructure is currently undergoing scheduled performance optimizations. We will be back online shortly!
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleSelectTab('admin')}
              className="text-xs text-red-400 hover:text-red-300 font-bold"
            >
              Administrator Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If in Admin Portal view
  if (currentTab === 'admin') {
    return (
      <>
        <SeoHead
          currentTab="admin"
          selectedCategorySlug=""
          categories={categories}
          searchParam=""
          detailsItem={null}
          movies={movies}
          series={series}
          settings={settings}
        />
        <AdminPortal
          onBackToSite={() => handleSelectTab('home')}
          movies={movies}
          series={series}
          episodes={episodes}
          categories={categories}
          languages={languages}
          settings={settings}
          users={allUsers}
          adminLogs={adminLogs}
          onSaveMovie={handleSaveMovie}
          onDeleteMovie={handleDeleteMovie}
          onSaveSeries={handleSaveSeries}
          onDeleteSeries={handleDeleteSeries}
          onSaveEpisode={handleSaveEpisode}
          onDeleteEpisode={handleDeleteEpisode}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onSaveLanguage={handleSaveLanguage}
          onDeleteLanguage={handleDeleteLanguage}
          onSaveSettings={handleSaveSettings}
          onUpdateUser={handleUpdateUser}
          onImportBulkMovies={handleImportBulkMovies}
          onSeedData={handleSeedData}
          isSeeding={isSeeding}
        />
      </>
    );
  }

  const favoriteIds = favorites.map((f) => f.mediaId);
  const isHiddenWelcomeAnnouncement =
    !settings.announcement ||
    settings.announcement
      .toLowerCase()
      .includes('stream your favorite 4k & 1080p movies with multi-server playback');
  const activeAnnouncement = isHiddenWelcomeAnnouncement ? '' : settings.announcement;

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f3f4f6] flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <SeoHead
        currentTab={currentTab}
        selectedCategorySlug={selectedCategorySlug}
        categories={categories}
        searchParam={searchParam}
        detailsItem={liveDetailsItem}
        movies={movies}
        series={series}
        settings={settings}
      />
      {/* Top Global Announcement Banner (Default welcome tagline hidden) */}
      {settings.announcementActive && activeAnnouncement && !announcementDismissed && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white text-xs font-semibold py-2 px-4 flex items-center justify-between shadow-md relative z-50">
          <div className="flex items-center gap-2 mx-auto text-center">
            <Bell className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{activeAnnouncement}</span>
          </div>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="text-white/80 hover:text-white text-xs font-bold px-2 py-0.5 rounded hover:bg-black/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        movies={movies}
        series={series}
        favoritesCount={favorites.length}
        onOpenDetails={handleOpenDetails}
        categories={categories}
        onSelectCategory={handleSelectCategoryRoute}
        noticesCount={settings.announcementActive && activeAnnouncement ? 1 : 0}
        onOpenNotices={() => setNoticeModalOpen(true)}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {liveDetailsItem ? (
          <MovieDetailsView
            media={liveDetailsItem}
            episodes={episodes}
            isFavorite={favoriteIds.includes(liveDetailsItem.id)}
            onToggleFavorite={handleToggleFavorite}
            onBackToHome={() => handleSelectTab('home')}
            onClose={handleCloseDetails}
            onPlay={(item) => handlePlayMedia(item)}
            onOpenPerson={(name, role) => setActivePerson({ name, role })}
            onSelectCategory={handleSelectCategoryRoute}
          />
        ) : (
          <>
        {currentTab === 'home' && (
          <HomePage
            movies={movies}
            series={series}
            categories={categories}
            watchHistory={watchHistory}
            favorites={favoriteIds}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onToggleFavorite={handleToggleFavorite}
            onSelectCategory={handleSelectCategoryRoute}
            onNavigateTab={handleSelectTab}
            onSelectFranchise={(f) => setActiveFranchise(f)}
          />
        )}

        {currentTab === 'movies' && (
          <MoviesPage
            movies={movies}
            categories={categories}
            languages={languages}
            favorites={favoriteIds}
            initialCategory={selectedCategorySlug}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'series' && (
          <SeriesPage
            series={series}
            languages={languages}
            favorites={favoriteIds}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'dramas' && (
          <DramasPage
            movies={movies}
            series={series}
            favorites={favoriteIds}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'trending' && (
          <TrendingPage
            movies={movies}
            series={series}
            favorites={favoriteIds}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'latest' && (
          <LatestReleasesPage
            movies={movies}
            series={series}
            favorites={favoriteIds}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'search' && (
          <SearchPage
            initialQuery={searchParam}
            movies={movies}
            series={series}
            categories={categories}
            languages={languages}
            favorites={favoriteIds}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {(currentTab === 'profile' || currentTab === 'profile-favorites' || currentTab === 'profile-history') && (
          <ProfilePage
            initialTab={currentTab === 'profile-history' ? 'history' : 'favorites'}
            movies={movies}
            series={series}
            favorites={favorites}
            watchHistory={watchHistory}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onRemoveFavorite={handleToggleFavorite}
            onRemoveHistory={handleRemoveHistory}
            onNavigateTab={handleSelectTab}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarPage
            movies={movies}
            series={series}
            onOpenDetails={handleOpenDetails}
            onPlay={handlePlayMedia}
          />
        )}

        {currentTab === 'watch-party' && (
          <WatchPartyPage
            movies={movies}
            series={series}
            onBack={() => handleSelectTab('home')}
          />
        )}

        {currentTab === 'support' && (
          <SupportPage />
        )}

        {currentTab === 'watch' && activeMedia && (
          <WatchPage
            media={activeMedia}
            initialEpisode={activeEpisode}
            episodes={episodes}
            isFavorite={favoriteIds.includes(activeMedia.id)}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => handleSelectTab('home')}
            onPlaySimilar={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            allMovies={movies}
            allSeries={series}
            onProgressUpdate={handleWatchProgress}
          />
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={handleSelectTab}
        isAdmin={Boolean(user && (isAdmin || user.email?.toLowerCase() === 'imdshofiqul863@gmail.com'))}
        telegramUrl={telegramChannelUrl}
      />

      {/* Cast & Director Profile Modal */}
      {activePerson && (
        <CastProfileModal
          personName={activePerson.name}
          role={activePerson.role}
          movies={movies}
          series={series}
          onClose={() => setActivePerson(null)}
          onPlay={(item, ep) => handlePlayMedia(item, ep)}
          onOpenDetails={handleOpenDetails}
        />
      )}

      {/* Franchise & Universe Collection Modal */}
      {activeFranchise && (
        <FranchiseModal
          collection={activeFranchise}
          movies={movies}
          series={series}
          favorites={favoriteIds}
          onClose={() => setActiveFranchise(null)}
          onPlay={(item, ep) => handlePlayMedia(item, ep)}
          onOpenDetails={handleOpenDetails}
        />
      )}

      {/* Notice Board Modal */}
      <NoticeBoardModal
        isOpen={noticeModalOpen}
        onClose={() => setNoticeModalOpen(false)}
        announcement={activeAnnouncement}
      />

      {/* Share Modal for Floating Telegram Action when no channel link is set */}
      <ShareModal
        isOpen={floatingShareOpen}
        onClose={() => setFloatingShareOpen(false)}
        title={liveDetailsItem ? liveDetailsItem.title : 'CineBox4u — Ultimate Movie Portal'}
        category={liveDetailsItem?.category}
        posterUrl={liveDetailsItem?.posterUrl}
      />

      {/* Floating Telegram Button (Opens configured channel link, or opens Telegram share without broken @cinebox4u) */}
      {telegramChannelUrl ? (
        <a
          href={telegramChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-4 sm:left-6 z-40 w-12 h-12 rounded-full bg-white hover:bg-zinc-100 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group border border-zinc-200 touch-manipulation"
          title="Join Telegram Channel"
          aria-label="Telegram"
        >
          <svg className="w-6 h-6 text-[#229ED9] fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setFloatingShareOpen(true)}
          className="fixed bottom-6 left-4 sm:left-6 z-40 w-12 h-12 rounded-full bg-white hover:bg-zinc-100 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group border border-zinc-200 cursor-pointer touch-manipulation"
          title="Share on Telegram"
          aria-label="Share on Telegram"
        >
          <svg className="w-6 h-6 text-[#229ED9] fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
        </button>
      )}


      {/* Auth Modal (Google & Email) */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LocaleProvider>
        <ProfileProvider>
          <ViewModeProvider>
            <MainApp />
          </ViewModeProvider>
        </ProfileProvider>
      </LocaleProvider>
    </AuthProvider>
  );
}
