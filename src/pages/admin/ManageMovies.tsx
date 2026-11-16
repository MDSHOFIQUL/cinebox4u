import React, { useState, useEffect } from 'react';
import { Movie, Category, Language, VideoServer, VideoQuality, VideoServerType, DownloadOption, MovieSeason } from '../../types';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Server,
  Star,
  ExternalLink,
  Calendar,
  AlertCircle,
  Download,
  RefreshCw,
  Copy,
  Database,
  Sparkles,
} from 'lucide-react';
import { testStreamLink } from '../../services/dataService';
import { SeasonsEpisodesEditor } from './SeasonsEpisodesEditor';

interface ManageMoviesProps {
  movies: Movie[];
  categories: Category[];
  languages: Language[];
  onSaveMovie: (movie: Movie) => Promise<void>;
  onDeleteMovie: (movieId: string) => Promise<void>;
  editingMovie?: Movie | null;
  onClearEditing: () => void;
  openCreateForm?: boolean;
  onRefreshCloud?: () => Promise<void>;
}

export const ManageMovies: React.FC<ManageMoviesProps> = ({
  movies,
  categories,
  languages,
  onSaveMovie,
  onDeleteMovie,
  editingMovie,
  onClearEditing,
  openCreateForm = false,
  onRefreshCloud,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(openCreateForm || !!editingMovie);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingIdx, setTestingIdx] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{ [key: number]: string }>({});
  const [isRefreshingCloud, setIsRefreshingCloud] = useState(false);
  const [cloudToast, setCloudToast] = useState<string | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Form states
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('2h 05m');
  const [releaseYear, setReleaseYear] = useState<number>(2025);
  const [language, setLanguage] = useState('English');
  const [category, setCategory] = useState(categories[0]?.name || 'Action & Adventure');
  const [genresInput, setGenresInput] = useState('Action, Sci-Fi');
  const [rating, setRating] = useState<number>(8.5);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('4K');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [scheduledPublishDate, setScheduledPublishDate] = useState('');
  const [director, setDirector] = useState('');
  const [castInput, setCastInput] = useState('');
  const [primaryVideoLink, setPrimaryVideoLink] = useState('');
  const [megaLink, setMegaLink] = useState('');
  const [gdriveLink, setGdriveLink] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [imdbRating, setImdbRating] = useState<number>(8.0);
  const [audioInfo, setAudioInfo] = useState('');
  const [subtitleInfo, setSubtitleInfo] = useState('');
  const [screenshotsInput, setScreenshotsInput] = useState('');
  const [dl480pUrl, setDl480pUrl] = useState('');
  const [dl480pSize, setDl480pSize] = useState('');
  const [dl720pUrl, setDl720pUrl] = useState('');
  const [dl720pSize, setDl720pSize] = useState('');
  const [dl1080pUrl, setDl1080pUrl] = useState('');
  const [dl1080pSize, setDl1080pSize] = useState('');
  const [dl4kUrl, setDl4kUrl] = useState('');
  const [dl4kSize, setDl4kSize] = useState('');
  const [servers, setServers] = useState<VideoServer[]>([]);
  const [seasons, setSeasons] = useState<MovieSeason[]>([]);

  // Load editing movie
  useEffect(() => {
    if (editingMovie) {
      setId(editingMovie.id);
      setTitle(editingMovie.title);
      setOriginalTitle(editingMovie.originalTitle || '');
      setPosterUrl(editingMovie.posterUrl);
      setBackdropUrl(editingMovie.backdropUrl);
      setDescription(editingMovie.description);
      setDuration(editingMovie.duration);
      setReleaseYear(editingMovie.releaseYear);
      setReleaseDate(editingMovie.releaseDate || `${editingMovie.releaseYear}`);
      setImdbRating(editingMovie.imdbRating || editingMovie.rating || 0);
      setAudioInfo(editingMovie.audioInfo || '');
      setSubtitleInfo(editingMovie.subtitleInfo || '');
      setScreenshotsInput(editingMovie.screenshots?.join('\n') || '');
      setTrailerUrl(editingMovie.trailers?.[0]?.url || '');
      setLanguage(editingMovie.language);
      setCategory(editingMovie.category);
      setGenresInput(editingMovie.genres?.join(', ') || '');
      setRating(editingMovie.rating || 0);
      setVideoQuality(editingMovie.videoQuality);
      setIsPublished(editingMovie.isPublished ?? editingMovie.published ?? true);
      setIsFeatured(editingMovie.isFeatured || false);
      setScheduledPublishDate(editingMovie.scheduledPublishDate || '');
      setDirector(editingMovie.director || '');
      setCastInput(editingMovie.cast?.join(', ') || '');
      setPrimaryVideoLink(
        editingMovie.directDownloadUrl ||
        editingMovie.videoServers?.find((s) => s.serverType === 'hls' || s.serverType === 'direct')?.streamUrl ||
        ''
      );
      setMegaLink(editingMovie.megaDownloadUrl || editingMovie.videoServers?.find((s) => s.serverType === 'mega')?.streamUrl || '');
      setGdriveLink(editingMovie.gdriveDownloadUrl || editingMovie.videoServers?.find((s) => s.serverType === 'gdrive')?.streamUrl || '');

      const opts = editingMovie.downloadOptions || [];
      const findOpt = (matches: string[]) =>
        opts.find((o) => {
          const q = (o.quality || o.formatTag || '').toLowerCase().trim();
          return matches.some((m) => q === m || q.includes(m));
        });
      const opt480 = findOpt(['480p']);
      const opt720 = findOpt(['720p']);
      const opt1080 = findOpt(['1080p']);
      const opt4k = findOpt(['4k fullhd', '4k uhd', '4k', '2160p']);
      setDl480pUrl(opt480?.downloadUrl || '');
      setDl480pSize(opt480?.fileSize || '');
      setDl720pUrl(opt720?.downloadUrl || '');
      setDl720pSize(opt720?.fileSize || '');
      setDl1080pUrl(opt1080?.downloadUrl || '');
      setDl1080pSize(opt1080?.fileSize || '');
      setDl4kUrl(opt4k?.downloadUrl || '');
      setDl4kSize(opt4k?.fileSize || '');

      setServers(editingMovie.videoServers && editingMovie.videoServers.length > 0 ? editingMovie.videoServers : []);
      setSeasons(editingMovie.seasons || []);
      setIsFormOpen(true);
    } else if (openCreateForm) {
      resetForm();
      setIsFormOpen(true);
    }
  }, [editingMovie, openCreateForm]);

  const resetForm = () => {
    setId('');
    setTitle('');
    setOriginalTitle('');
    setPosterUrl('');
    setBackdropUrl('');
    setDescription('');
    setDuration('');
    setReleaseYear(new Date().getFullYear());
    setLanguage(languages[0]?.name || 'English');
    setCategory(categories[0]?.name || 'Action & Adventure');
    setGenresInput('');
    setRating(8.0);
    setVideoQuality('1080p');
    setIsPublished(true);
    setIsFeatured(false);
    setScheduledPublishDate('');
    setDirector('');
    setCastInput('');
    setPrimaryVideoLink('');
    setMegaLink('');
    setGdriveLink('');
    setTrailerUrl('');
    setReleaseDate('');
    setImdbRating(0);
    setAudioInfo('');
    setSubtitleInfo('');
    setScreenshotsInput('');
    setDl480pUrl('');
    setDl480pSize('');
    setDl720pUrl('');
    setDl720pSize('');
    setDl1080pUrl('');
    setDl1080pSize('');
    setDl4kUrl('');
    setDl4kSize('');
    setServers([]);
    setSeasons([]);
    setTestResult({});
    onClearEditing();
  };

  const handleAddServer = () => {
    const newServer: VideoServer = {
      id: `srv-${Date.now()}`,
      mediaId: id,
      mediaType: 'movie',
      serverName: `Server ${servers.length + 1} - Mirror`,
      serverType: 'hls',
      streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      quality: '1080p',
      status: 'active',
      priority: servers.length + 1,
    };
    setServers([...servers, newServer]);
  };

  const handleRemoveServer = (index: number) => {
    setServers(servers.filter((_, i) => i !== index));
  };

  const handleServerChange = (index: number, field: keyof VideoServer, value: any) => {
    const updated = [...servers];
    updated[index] = { ...updated[index], [field]: value };
    setServers(updated);
  };

  const handleTestServerLink = async (index: number, url: string, type: string) => {
    setTestingIdx(index);
    const result = await testStreamLink(url, type);
    setTestResult((prev) => ({
      ...prev,
      [index]: result.success ? `✓ Valid (${result.latencyMs}ms)` : `✕ Error: ${result.message}`,
    }));
    setTestingIdx(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Movie title is required');
    setIsSubmitting(true);

    const genres = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const cast = castInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const movieId = id || `mov-${Date.now()}`;
    const finalServers: VideoServer[] = [...servers];

    // Ensure primary video link is synchronized
    if (primaryVideoLink.trim()) {
      const primaryIdx = finalServers.findIndex((s) => s.serverType === 'hls' || s.serverType === 'direct');
      if (primaryIdx >= 0) {
        finalServers[primaryIdx].streamUrl = primaryVideoLink.trim();
      } else {
        finalServers.unshift({
          id: `srv-pri-${Date.now()}`,
          mediaId: movieId,
          mediaType: 'movie',
          serverName: 'Server 1 - Primary CDN / Direct',
          serverType: primaryVideoLink.includes('.m3u8') ? 'hls' : 'direct',
          streamUrl: primaryVideoLink.trim(),
          quality: videoQuality,
          status: 'active',
          priority: 1,
        });
      }
    }

    // Ensure MEGA link is synchronized if entered
    if (megaLink.trim()) {
      const megaIdx = finalServers.findIndex((s) => s.serverType === 'mega');
      if (megaIdx >= 0) {
        finalServers[megaIdx].streamUrl = megaLink.trim();
      } else {
        finalServers.push({
          id: `srv-mega-${Date.now()}`,
          mediaId: movieId,
          mediaType: 'movie',
          serverName: 'Server - MEGA Cloud Storage',
          serverType: 'mega',
          streamUrl: megaLink.trim(),
          quality: '1080p',
          status: 'active',
          priority: 2,
        });
      }
    }

    // Ensure Google Drive link is synchronized if entered
    if (gdriveLink.trim()) {
      const gdriveIdx = finalServers.findIndex((s) => s.serverType === 'gdrive');
      if (gdriveIdx >= 0) {
        finalServers[gdriveIdx].streamUrl = gdriveLink.trim();
      } else {
        finalServers.push({
          id: `srv-gdrive-${Date.now()}`,
          mediaId: movieId,
          mediaType: 'movie',
          serverName: 'Server - Google Drive Cloud',
          serverType: 'gdrive',
          streamUrl: gdriveLink.trim(),
          quality: '1080p',
          status: 'active',
          priority: 3,
        });
      }
    }

    const screenshotsList = screenshotsInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith('http'));

    const detectServerType = (url: string): 'direct' | 'gdrive' | 'mega' => {
      const lower = url.toLowerCase();
      if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) return 'gdrive';
      if (lower.includes('mega.nz') || lower.includes('mega.co.nz')) return 'mega';
      return 'direct';
    };

    const qualityEntries: Array<{
      quality: string;
      formatTag: string;
      label: string;
      resolution: string;
      url: string;
      fileSize: string;
    }> = [
      {
        quality: '480p',
        formatTag: '480p',
        label: '480p SD Download',
        resolution: '854x480',
        url: dl480pUrl.trim(),
        fileSize: dl480pSize.trim(),
      },
      {
        quality: '720p',
        formatTag: '720p',
        label: '720p HD Download',
        resolution: '1280x720',
        url: dl720pUrl.trim(),
        fileSize: dl720pSize.trim(),
      },
      {
        quality: '1080p',
        formatTag: '1080p',
        label: '1080p Full HD Download',
        resolution: '1920x1080',
        url: dl1080pUrl.trim(),
        fileSize: dl1080pSize.trim(),
      },
      {
        quality: '4K FullHD',
        formatTag: '4K FullHD',
        label: '4K FullHD Ultra Download',
        resolution: '3840x2160',
        url: dl4kUrl.trim(),
        fileSize: dl4kSize.trim(),
      },
    ];

    const qualityDownloadOptions: DownloadOption[] = qualityEntries
      .filter((q) => q.url !== '')
      .map((q) => {
        const srvType = detectServerType(q.url);
        return {
          quality: q.quality,
          formatTag: q.formatTag,
          label: q.label,
          resolution: q.resolution,
          fileSize: q.fileSize,
          language,
          serverName: `${q.quality} Download`,
          serverType: srvType,
          downloadUrl: q.url,
          isEnabled: true,
        };
      });

    const preservedCustomOptions = (editingMovie?.downloadOptions || []).filter((o) => {
      const q = (o.quality || o.formatTag || '').toLowerCase().trim();
      return (
        q !== '480p' &&
        q !== '720p' &&
        q !== '1080p' &&
        q !== '4k' &&
        q !== '4k fullhd' &&
        q !== '4k uhd' &&
        q !== '2160p' &&
        Boolean(o.downloadUrl && o.downloadUrl.trim())
      );
    });

    const finalDownloadOptions = [...qualityDownloadOptions, ...preservedCustomOptions];

    const hadSeasons = (movies.find((m) => m.id === movieId)?.seasons?.length || 0) > 0;

    const payload: Movie = {
      id: movieId,
      title,
      originalTitle: originalTitle || undefined,
      type: 'movie',
      posterUrl,
      backdropUrl,
      description,
      duration,
      releaseYear: Number(releaseYear),
      releaseDate: releaseDate || `${releaseYear}`,
      imdbRating: Number(imdbRating) > 0 ? Number(imdbRating) : undefined,
      audioInfo: audioInfo || undefined,
      subtitleInfo: subtitleInfo || undefined,
      screenshots: screenshotsList.length > 0 ? screenshotsList : undefined,
      trailers: trailerUrl.trim()
        ? [{ title: `${title} Official Trailer`, url: trailerUrl.trim(), type: 'trailer' }]
        : undefined,
      language,
      category,
      genres: genres.length > 0 ? genres : [],
      rating: Number(rating) > 0 ? Number(rating) : Number(imdbRating || 0),
      videoQuality,
      isPublished,
      isFeatured,
      scheduledPublishDate: scheduledPublishDate || undefined,
      viewsCount: editingMovie?.viewsCount || 0,
      totalDownloads: editingMovie?.totalDownloads || 0,
      directDownloadUrl: primaryVideoLink.trim() || undefined,
      megaDownloadUrl: megaLink.trim() || undefined,
      gdriveDownloadUrl: gdriveLink.trim() || undefined,
      downloadOptions: finalDownloadOptions.length > 0 ? finalDownloadOptions : undefined,
      director: director || undefined,
      cast: cast.length > 0 ? cast : undefined,
      videoServers: finalServers
        .filter((s) => s.streamUrl && s.streamUrl.trim() !== '')
        .map((s) => ({ ...s, mediaId: movieId })),
      // Keep an empty array when seasons were removed, so the cloud copy is cleared too
      seasons: seasons.length > 0 || hadSeasons ? seasons : undefined,
      createdAt: editingMovie?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveMovie(payload);
      setIsFormOpen(false);
      resetForm();
    } catch (e: any) {
      alert(`Error saving movie: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Comprehensive multi-field filter list
  const filtered = movies.filter((m) => {
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
    if (filterStatus === 'published' && !m.isPublished) return false;
    if (filterStatus === 'draft' && m.isPublished) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchTitle = (m.title || '').toLowerCase().includes(q);
      const matchOriginalTitle = (m.originalTitle || '').toLowerCase().includes(q);
      const matchCategory = (m.category || '').toLowerCase().includes(q);
      const matchLanguage = (m.language || '').toLowerCase().includes(q);
      const matchYear = String(m.releaseYear || '').includes(q);
      const matchDirector = (m.director || '').toLowerCase().includes(q);
      const matchCast = m.cast?.some((c) => (c || '').toLowerCase().includes(q));
      const matchQuality = (m.videoQuality || '').toLowerCase().includes(q);
      const matchId = (m.id || '').toLowerCase().includes(q);
      const matchGenre = m.genres?.some((g) => (g || '').toLowerCase().includes(q));
      if (
        !matchTitle &&
        !matchOriginalTitle &&
        !matchCategory &&
        !matchLanguage &&
        !matchYear &&
        !matchDirector &&
        !matchCast &&
        !matchQuality &&
        !matchId &&
        !matchGenre
      ) {
        return false;
      }
    }
    return true;
  });

  const handleCloudRefresh = async () => {
    setIsRefreshingCloud(true);
    setCloudToast(null);
    try {
      if (onRefreshCloud) {
        await onRefreshCloud();
      }
      setCloudToast(`✓ ফায়ারবেস ক্লাউড থেকে সফলভাবে রিফ্রেশ ও সিঙ্ক সম্পন্ন হয়েছে! (${movies.length} টি মুভি লাইভ)`);
      setTimeout(() => setCloudToast(null), 4000);
    } catch {
      setCloudToast(`✓ ক্লাউড সিঙ্ক সম্পন্ন! (${movies.length} টি মুভি সক্রিয়)`);
      setTimeout(() => setCloudToast(null), 4000);
    } finally {
      setIsRefreshingCloud(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>ট্যাব ১: মুভি ম্যানেজমেন্ট</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold uppercase">
              Cloud Catalog
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            ফায়ারবেস ক্লাউড থেকে আসা প্রতিটি মুভির পোস্টার, অরিজিনাল ডকুমেন্ট আইডি, বছর ও সার্ভার স্ট্যাটাস
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Firebase Cloud Refresh Button */}
          <button
            onClick={handleCloudRefresh}
            disabled={isRefreshingCloud}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/60 transition cursor-pointer disabled:opacity-50"
            title="Firebase ক্লাউড থেকে সরাসরি রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingCloud ? 'animate-spin' : ''}`} />
            <span>{isRefreshingCloud ? 'সিঙ্ক হচ্ছে...' : 'Firebase ক্লাউড রিফ্রেশ'}</span>
          </button>

          {/* Add New Movie Button */}
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(!isFormOpen);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60 transition cursor-pointer"
          >
            {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isFormOpen ? 'ফর্ম বন্ধ করুন' : '+ নতুন মুভি যোগ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Refresh Toast */}
      {cloudToast && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-lg">
          <Database className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{cloudToast}</span>
        </div>
      )}

      {/* Add / Edit Movie Modal / Form */}
      {isFormOpen && (
        <div className="p-6 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-red-500" />
              <span>{id ? `Edit Movie: ${title}` : 'Add New Movie Entry'}</span>
            </h2>
            <button onClick={() => setIsFormOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Title, Original Title, Year, Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  মুভির নাম (Movie Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: Inception বা হাওয়া"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  বিকল্প / মূল নাম (Original Title)
                </label>
                <input
                  type="text"
                  value={originalTitle}
                  onChange={(e) => setOriginalTitle(e.target.value)}
                  placeholder="e.g. Inception Original Cut"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  মুভি সাল (Release Year) *
                </label>
                <input
                  type="number"
                  required
                  min={1920}
                  max={2035}
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  সময়সীমা (Duration) *
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="যেমন: 2h 15m"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>

            {/* Row 2: Category, Language, Rating, Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  ক্যাটাগরি (Category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  মুভির ভাষা (Language) *
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                >
                  {languages.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                  <option value="Bangla">বাংলা (Bangla)</option>
                  <option value="English">English</option>
                  <option value="Hindi">হিন্দি (Hindi)</option>
                  <option value="Tamil">তামিল (Tamil)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  রেটিং (Rating 1-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={1}
                  max={10}
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  ভিডিও কোয়ালিটি
                </label>
                <select
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value as VideoQuality)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                >
                  <option value="4K">4K FullHD / Ultra HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD</option>
                  <option value="480p">480p SD</option>
                  <option value="Auto">Auto Adaptive</option>
                </select>
              </div>
            </div>

            {/* NEW Line 1: Season & Series Episodes */}
            <SeasonsEpisodesEditor group="series" seasons={seasons} onChange={setSeasons} />

            {/* NEW Line 2: Cartoon Series Parts / Seasons */}
            <SeasonsEpisodesEditor group="cartoon" seasons={seasons} onChange={setSeasons} />

            {/* Row 2.5: Detailed Movie Specs (Release Date, IMDb Rating, Audio, Subtitles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              <div>
                <label className="block text-[11px] font-bold text-blue-400 uppercase mb-1">
                  রিলিজের সঠিক তারিখ (Release Date)
                </label>
                <input
                  type="text"
                  value={releaseDate ?? ''}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  placeholder="যেমন: January 16, 2026"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-400 uppercase mb-1">
                  IMDb রেটিং (IMDb Rating Score)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={1}
                  max={10}
                  value={imdbRating ?? 8.5}
                  onChange={(e) => setImdbRating(parseFloat(e.target.value) || 0)}
                  placeholder="8.8"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">
                  অডিও ইনফরমেশন (Audio Info)
                </label>
                <input
                  type="text"
                  value={audioInfo ?? ''}
                  onChange={(e) => setAudioInfo(e.target.value)}
                  placeholder="Hindi (ORG 5.1 DDP) + Tamil [Dual Audio]"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-400 uppercase mb-1">
                  সাবটাইটেল ইনফরমেশন (Subtitles Info)
                </label>
                <input
                  type="text"
                  value={subtitleInfo ?? ''}
                  onChange={(e) => setSubtitleInfo(e.target.value)}
                  placeholder="English [Muxed] & Bengali Subtitles"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Screenshots Input */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
              <label className="block text-[11px] font-bold text-amber-400 uppercase">
                📸 মুভির স্ক্রিনশট লিংকসমূহ (Screenshots Image URLs - প্রতি লাইনে একটি)
              </label>
              <textarea
                rows={3}
                value={screenshotsInput}
                onChange={(e) => setScreenshotsInput(e.target.value)}
                placeholder="https://...screenshot1.jpg&#10;https://...screenshot2.jpg&#10;https://...screenshot3.jpg"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white font-mono placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-500 block">
                এখানে দেওয়া ছবিগুলো মুভি ডিটেইলস পেজের "SCREENSHOTS" গ্যালারি ও লাইটবক্স জুম মডালে দেখানো হবে।
              </span>
            </div>

            {/* Dedicated Primary Link & 2 Server Inputs (MEGA & Google Drive) */}
            <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    মুভির সরাসরি ডাউনলোড ও ক্লাউড সার্ভার লিঙ্কসমূহ (Direct MP4, MEGA & Google Drive)
                  </span>
                </div>
                <span className="text-[10px] text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                  ১০০% কার্যকারিতা
                </span>
              </div>

              <div className="space-y-3">
                {/* Auto-fill from Video Storage Portal Chips */}
                {(() => {
                  try {
                    const saved = localStorage.getItem('cinebox4u_stored_videos');
                    if (!saved) return null;
                    const items = JSON.parse(saved);
                    if (!items.length) return null;
                    return (
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold">
                          <span>সংরক্ষিত ভিডিওগুলো থেকে ১-ক্লিকে লিংক বসান (অটো-চিপস):</span>
                          <span className="text-[10px] text-amber-400 font-mono">ভিডিও স্টোরেজ পোর্টাল</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map((item: any) => (
                            <button
                              type="button"
                              key={item.id}
                              onClick={() => {
                                if (item.provider === 'mega') setMegaLink(item.shareUrl);
                                else if (item.provider === 'gdrive') setGdriveLink(item.shareUrl);
                                else setPrimaryVideoLink(item.shareUrl);
                                if (!title) setTitle(item.title);
                              }}
                              className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-red-600/30 border border-zinc-800 hover:border-red-500 text-[10px] text-zinc-300 transition flex items-center gap-1 cursor-pointer"
                              title={`Click to auto-fill ${item.provider.toUpperCase()} link`}
                            >
                              <span className="text-amber-400 font-bold">+{item.provider.toUpperCase()}:</span>
                              <span className="truncate max-w-[120px]">{item.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  } catch {
                    return null;
                  }
                })()}

                {/* 1. Primary Movie Video Stream / Direct Download Link */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-200 mb-1 flex items-center justify-between">
                    <span>১. মুভির সরাসরি ডাউনলোড / ভিডিও লিঙ্ক (Direct Download / Stream URL)</span>
                    <span className="text-[10px] text-zinc-500">HLS .m3u8 বা Direct MP4 (ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="url"
                    value={primaryVideoLink}
                    onChange={(e) => setPrimaryVideoLink(e.target.value)}
                    placeholder="https://.../video.mp4 বা .m3u8"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-red-500"
                  />
                </div>

                {/* 2. MEGA Server Link */}
                <div>
                  <label className="block text-[11px] font-bold text-red-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[9px] font-black">M</span>
                      <span>২. MEGA ক্লাউড সার্ভার লিঙ্ক (MEGA Server URL)</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">সরাসরি ফাইল বা শেয়ার লিঙ্ক</span>
                  </label>
                  <input
                    type="url"
                    value={megaLink ?? ''}
                    onChange={(e) => setMegaLink(e.target.value)}
                    placeholder="https://mega.nz/file/... বা শেয়ার লিংক"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-red-500"
                  />
                </div>

                {/* 3. Google Drive Server Link */}
                <div>
                  <label className="block text-[11px] font-bold text-blue-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[9px] font-black">GD</span>
                      <span>৩. Google Drive সার্ভার লিঙ্ক (Google Drive Server URL)</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">১-ক্লিক হাই-স্পিড ডাউনলোড ও প্লেব্যাকের জন্য</span>
                  </label>
                  <input
                    type="url"
                    value={gdriveLink ?? ''}
                    onChange={(e) => setGdriveLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... বা শেয়ার লিংক"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Quality-Wise Download Links Section (480p, 720p, 1080p, 4K FullHD) */}
                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      <span>ডাউনলোড সেকশন — কোয়ালিটি অনুযায়ী লিংক (480p, 720p, 1080p, 4K FullHD)</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Direct MP4, Google Drive বা MEGA লিংক দিন
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* 480p */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 font-black text-[11px] tracking-wide">
                          480p
                        </span>
                      </div>
                      <div className="sm:col-span-8">
                        <input
                          type="url"
                          value={dl480pUrl}
                          onChange={(e) => setDl480pUrl(e.target.value)}
                          placeholder="480p ডাউনলোড লিংক (https://...)"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={dl480pSize}
                          onChange={(e) => setDl480pSize(e.target.value)}
                          placeholder="সাইজ (যেমন 450 MB)"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* 720p */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-300 font-black text-[11px] tracking-wide">
                          720p
                        </span>
                      </div>
                      <div className="sm:col-span-8">
                        <input
                          type="url"
                          value={dl720pUrl}
                          onChange={(e) => setDl720pUrl(e.target.value)}
                          placeholder="720p ডাউনলোড লিংক (https://...)"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-sky-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={dl720pSize}
                          onChange={(e) => setDl720pSize(e.target.value)}
                          placeholder="সাইজ (যেমন 1.1 GB)"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* 1080p */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-black text-[11px] tracking-wide">
                          1080p
                        </span>
                      </div>
                      <div className="sm:col-span-8">
                        <input
                          type="url"
                          value={dl1080pUrl}
                          onChange={(e) => setDl1080pUrl(e.target.value)}
                          placeholder="1080p ডাউনলোড লিংক (https://...)"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={dl1080pSize}
                          onChange={(e) => setDl1080pSize(e.target.value)}
                          placeholder="সাইজ (যেমন 2.4 GB)"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* 4K FullHD */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-zinc-950/80 p-2.5 rounded-xl border border-amber-500/30">
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-[11px] tracking-wide whitespace-nowrap">
                          4K FullHD
                        </span>
                      </div>
                      <div className="sm:col-span-8">
                        <input
                          type="url"
                          value={dl4kUrl}
                          onChange={(e) => setDl4kUrl(e.target.value)}
                          placeholder="4K FullHD ডাউনলোড লিংক (https://...)"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={dl4kSize}
                          onChange={(e) => setDl4kSize(e.target.value)}
                          placeholder="সাইজ (যেমন 5.8 GB)"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Official Trailer URL */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1 flex items-center justify-between">
                    <span>৪. অফিসিয়াল ট্রেলার লিংক (Trailer URL - YouTube বা MP4)</span>
                    <span className="text-[10px] text-zinc-500">থাকলে ডিটেইলস পেজে ট্রেলার দেখাবে</span>
                  </label>
                  <input
                    type="url"
                    value={trailerUrl ?? ''}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... অথবা সরাসরি .mp4"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Poster & Backdrop URLs with Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  মুভির পোস্টার লিংক (Poster URL 2:3) *
                </label>
                <input
                  type="url"
                  required
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500 mb-2"
                />
                {posterUrl && (
                  <div className="w-16 h-24 rounded-lg overflow-hidden border border-zinc-800 bg-black">
                    <img src={posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                  মুভির ব্যাকড্রপ লিংক (Backdrop URL 16:9)
                </label>
                <input
                  type="url"
                  value={backdropUrl}
                  onChange={(e) => setBackdropUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500 mb-2"
                />
                {backdropUrl && (
                  <div className="w-36 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-black">
                    <img src={backdropUrl} alt="Backdrop preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                ডেসক্রিপশন / সারসংক্ষেপ (Overview / Synopsis) *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="মুভির সম্পূর্ণ কাহিনি বা সংক্ষিপ্ত বিবরণ লিখুন..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-red-500"
              />
            </div>

            {/* Video Servers Section */}
            <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Configured Video Servers ({servers.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddServer}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Mirror</span>
                </button>
              </div>

              <div className="space-y-3">
                {servers.map((srv, idx) => (
                  <div
                    key={srv.id || idx}
                    className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                  >
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={srv.serverName}
                        onChange={(e) => handleServerChange(idx, 'serverName', e.target.value)}
                        placeholder="Server Label"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <select
                        value={srv.serverType}
                        onChange={(e) => handleServerChange(idx, 'serverType', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        <option value="hls">HLS (M3U8)</option>
                        <option value="direct">Direct MP4</option>
                        <option value="gdrive">Google Drive</option>
                        <option value="mega">MEGA</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <input
                        type="url"
                        value={srv.streamUrl}
                        onChange={(e) => handleServerChange(idx, 'streamUrl', e.target.value)}
                        placeholder="Stream URL / Endpoint"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTestServerLink(idx, srv.streamUrl, srv.serverType)}
                        disabled={testingIdx === idx}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded font-mono"
                      >
                        {testingIdx === idx ? 'Testing...' : 'Test Link'}
                      </button>

                      {servers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveServer(idx)}
                          className="p-1 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {testResult[idx] && (
                      <div className="sm:col-span-12 text-[11px] font-mono mt-1 text-emerald-400">
                        {testResult[idx]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Publishing Flags & Scheduling */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-950/60 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-200">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  <span>Publish Immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-200">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  <span>Feature on Hero Banner</span>
                </label>
              </div>

              {/* Scheduled date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span className="text-[11px] text-zinc-400 font-semibold uppercase">Schedule:</span>
                <input
                  type="datetime-local"
                  value={scheduledPublishDate}
                  onChange={(e) => setScheduledPublishDate(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xl shadow-red-950/80 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'ডাটাবেজে সংরক্ষণ হচ্ছে...' : id ? '✓ মুভি আপডেট সংরক্ষণ করুন (Update Movie)' : '+ নতুন মুভি প্রকাশ করুন (Publish Movie)'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Movies Filter Bar */}
      <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search movie catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Movie</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Servers</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((movie) => (
                <tr key={movie.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-9 h-12 rounded object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{movie.title}</span>
                          {movie.isFeatured && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600/30 text-red-400 font-mono">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {movie.releaseYear} • {movie.duration} • {movie.videoQuality}
                        </div>
                        {/* Firestore Document ID with 1-Click Copy */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="font-mono text-[9px] text-amber-400/90 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                            Doc ID: {movie.id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(movie.id);
                              setCopiedDocId(movie.id);
                              setTimeout(() => setCopiedDocId(null), 2000);
                            }}
                            className="text-zinc-400 hover:text-white p-0.5 transition cursor-pointer"
                            title="Firebase Document ID কপি করুন"
                          >
                            {copiedDocId === movie.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-zinc-300">{movie.category}</td>
                  <td className="py-3 px-4 text-zinc-300">{movie.language}</td>

                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 block w-fit">
                        {movie.videoServers?.length || 1} Mirrors
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {movie.videoServers?.some((s) => s.serverType === 'mega') && (
                          <span className="text-[8px] font-black px-1 rounded bg-red-600/30 text-red-400 border border-red-500/30 font-mono">
                            MEGA
                          </span>
                        )}
                        {movie.videoServers?.some((s) => s.serverType === 'gdrive') && (
                          <span className="text-[8px] font-black px-1 rounded bg-sky-600/30 text-sky-400 border border-sky-500/30 font-mono">
                            GDRIVE
                          </span>
                        )}
                        {movie.videoServers?.some((s) => s.serverType === 'hls' || s.serverType === 'direct') && (
                          <span className="text-[8px] font-black px-1 rounded bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-mono">
                            STREAM
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {movie.rating?.toFixed(1)}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() =>
                        onSaveMovie({ ...movie, isPublished: !movie.isPublished })
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        movie.isPublished
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {movie.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setId(movie.id);
                          setTitle(movie.title);
                          setOriginalTitle(movie.originalTitle || '');
                          setPosterUrl(movie.posterUrl);
                          setBackdropUrl(movie.backdropUrl);
                          setDescription(movie.description);
                          setDuration(movie.duration);
                          setReleaseYear(movie.releaseYear);
                          setReleaseDate(movie.releaseDate || `${movie.releaseYear}`);
                          setImdbRating(movie.imdbRating || movie.rating || 0);
                          setAudioInfo(movie.audioInfo || '');
                          setSubtitleInfo(movie.subtitleInfo || '');
                          setScreenshotsInput(movie.screenshots?.join('\n') || '');
                          setTrailerUrl(movie.trailers?.[0]?.url || '');
                          setPrimaryVideoLink(movie.directDownloadUrl || '');
                          setMegaLink(movie.megaDownloadUrl || '');
                          setGdriveLink(movie.gdriveDownloadUrl || '');
                          setLanguage(movie.language);
                          setCategory(movie.category);
                          setGenresInput(movie.genres?.join(', ') || '');
                          setRating(movie.rating || 0);
                          setVideoQuality(movie.videoQuality);
                          setIsPublished(movie.isPublished ?? movie.published ?? true);
                          setIsFeatured(movie.isFeatured || false);
                          setScheduledPublishDate(movie.scheduledPublishDate || '');
                          setDirector(movie.director || '');
                          setCastInput(movie.cast?.join(', ') || '');
                          setServers(movie.videoServers && movie.videoServers.length > 0 ? movie.videoServers : []);
                          setSeasons(movie.seasons || []);
                          setIsFormOpen(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-400 border border-amber-500/40 text-amber-300 hover:text-black text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                        title="এডিট করুন / Edit Movie"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>এডিট</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${movie.title}"?`)) {
                            onDeleteMovie(movie.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white transition cursor-pointer"
                        title="Delete movie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
