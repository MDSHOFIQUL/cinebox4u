import React, { useMemo, useState } from 'react';
import {
  Download,
  Check,
  HardDrive,
  Cloud,
  Link2,
  AlertCircle,
  Zap,
  ExternalLink,
  Tv,
} from 'lucide-react';
import { Movie, Series, Episode } from '../types';

interface MovieDownloadLinksSectionProps {
  media: Movie | Series;
  episodes?: Episode[];
  onDownloadTriggered?: (quality: string) => void;
}

interface ResolvedServerItem {
  id: string;
  label: string;
  serverName: string;
  serverType: 'direct' | 'gdrive' | 'mega' | 'hls' | 'dash' | string;
  quality?: string;
  resolution?: string;
  codec?: string;
  fileSize?: string;
  language?: string;
  url: string;
  isCloudPortal: boolean;
}

function normalizeUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#') return '';
  return trimmed;
}

function getGoogleDriveDownloadUrl(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}&confirm=t`;
  }
  return url;
}

function isDisallowedServerType(serverType?: string): boolean {
  const normalized = (serverType || '').toLowerCase().trim();
  return normalized === 'telegram' || normalized === 'terabox';
}

export const MovieDownloadLinksSection: React.FC<MovieDownloadLinksSectionProps> = ({
  media,
  episodes = [],
  onDownloadTriggered,
}) => {
  const isMovie = media.type === 'movie';
  const movie = isMovie ? (media as Movie) : null;

  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  // Build list strictly from real Admin / Firebase configured links (excluding Telegram & TeraBox)
  const resolvedServers = useMemo<ResolvedServerItem[]>(() => {
    const items: ResolvedServerItem[] = [];
    const seenUrls = new Set<string>();

    const addItem = (item: ResolvedServerItem) => {
      if (isDisallowedServerType(item.serverType)) return;
      const cleanUrl = normalizeUrl(item.url);
      if (!cleanUrl) return;
      if (cleanUrl.toLowerCase().includes('terabox') || cleanUrl.toLowerCase().includes('t.me/')) {
        return;
      }
      const finalUrl =
        item.serverType === 'gdrive' ? getGoogleDriveDownloadUrl(cleanUrl) : cleanUrl;
      const dedupeKey = `${item.serverType}:${item.quality || ''}:${finalUrl}`;
      if (seenUrls.has(dedupeKey)) return;
      seenUrls.add(dedupeKey);
      items.push({ ...item, url: finalUrl });
    };

    const resolveTypeFromUrl = (url: string, explicitType?: string) => {
      const lower = url.toLowerCase();
      if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) return 'gdrive';
      if (lower.includes('mega.nz') || lower.includes('mega.co.nz')) return 'mega';
      return explicitType || 'direct';
    };

    // 1. Structured Download Options configured in Admin Panel (480p, 720p, 1080p, 4K FullHD)
    if (movie?.downloadOptions && Array.isArray(movie.downloadOptions)) {
      movie.downloadOptions.forEach((opt, idx) => {
        if (opt.isEnabled === false) return;
        const url = normalizeUrl(opt.downloadUrl);
        if (!url) return;
        const type = resolveTypeFromUrl(url, opt.serverType);
        if (isDisallowedServerType(type)) return;
        const qualityText = opt.formatTag || opt.quality || 'HD';
        addItem({
          id: `opt-${idx}`,
          label: opt.label || `${qualityText} Download`,
          serverName: opt.serverName || `${qualityText} Download`,
          serverType: type,
          quality: qualityText,
          resolution: opt.resolution,
          codec: opt.codec,
          fileSize: opt.fileSize,
          language: opt.language || media.language,
          url,
          isCloudPortal: ['gdrive', 'mega'].includes(type),
        });
      });
    }

    // 2. Direct MP4 Download URL
    if (movie?.directDownloadUrl) {
      addItem({
        id: 'direct-url',
        label: `${movie.videoQuality || 'HD'} Direct Download`,
        serverName: 'Direct High-Speed Server',
        serverType: 'direct',
        quality: movie.videoQuality || movie.badgeQuality,
        language: media.language,
        url: movie.directDownloadUrl,
        isCloudPortal: false,
      });
    }

    // 3. Google Drive URL
    if (movie?.gdriveDownloadUrl) {
      addItem({
        id: 'gdrive-url',
        label: 'Google Drive Server',
        serverName: 'Google Drive',
        serverType: 'gdrive',
        quality: movie.videoQuality || movie.badgeQuality,
        language: media.language,
        url: movie.gdriveDownloadUrl,
        isCloudPortal: true,
      });
    }

    // 4. MEGA URL
    if (movie?.megaDownloadUrl) {
      addItem({
        id: 'mega-url',
        label: 'MEGA Cloud Server',
        serverName: 'MEGA.nz',
        serverType: 'mega',
        quality: movie.videoQuality || movie.badgeQuality,
        language: media.language,
        url: movie.megaDownloadUrl,
        isCloudPortal: true,
      });
    }

    // 5. Additional Video / Download Servers from Admin Panel
    if (media.videoServers && Array.isArray(media.videoServers)) {
      media.videoServers.forEach((srv, idx) => {
        if (srv.status === 'broken' || isDisallowedServerType(srv.serverType)) return;
        const url = normalizeUrl(srv.streamUrl);
        if (!url) return;
        addItem({
          id: srv.id || `srv-${idx}`,
          label: srv.serverName || `Server ${idx + 1}`,
          serverName: srv.serverName || srv.serverType.toUpperCase(),
          serverType: srv.serverType || 'direct',
          quality: srv.quality,
          language: media.language,
          url,
          isCloudPortal: ['gdrive', 'mega'].includes(srv.serverType),
        });
      });
    }

    return items;
  }, [media, movie]);

  // Episodes for Series
  const seriesEpisodes = useMemo(() => {
    if (media.type !== 'series') return [];
    return episodes
      .filter((ep) => ep.seriesId === media.id)
      .sort((a, b) =>
        a.seasonNumber !== b.seasonNumber
          ? a.seasonNumber - b.seasonNumber
          : a.episodeNumber - b.episodeNumber
      );
  }, [episodes, media.id, media.type]);

  const handleTrackDownload = (item: ResolvedServerItem) => {
    setDownloadedId(item.id);
    import('../services/dataService')
      .then(({ recordDownloadEvent }) => {
        recordDownloadEvent(media.id, media.title, item.quality || item.label, item.serverType);
      })
      .catch(() => {});
    if (onDownloadTriggered) {
      onDownloadTriggered(item.quality || item.label);
    }
    setTimeout(() => setDownloadedId(null), 3000);
  };

  const getServerIcon = (type: string) => {
    switch (type) {
      case 'gdrive':
        return <Cloud className="w-4 h-4 text-sky-400" />;
      case 'mega':
        return <HardDrive className="w-4 h-4 text-red-400" />;
      default:
        return <Link2 className="w-4 h-4 text-amber-400" />;
    }
  };

  const getServerBadgeColor = (type: string) => {
    switch (type) {
      case 'gdrive':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'mega':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <section id="download-links-section" className="space-y-5">
      {/* Section Header */}
      <div className="bg-[#101117] border border-zinc-800 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-950/60 shrink-0">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Download & Available Servers
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {media.title} — অনুমোদিত ও অ্যাডমিন-কনফিগার্ড ডাউনলোড সার্ভার সমূহ
              </p>
            </div>
          </div>

          {resolvedServers.length > 0 && (
            <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800 text-xs font-bold text-amber-400 w-fit tabular-nums">
              <Zap className="w-4 h-4 shrink-0" />
              <span>{resolvedServers.length} টি সার্ভার উপলব্ধ</span>
            </div>
          )}
        </div>

        {downloadedId && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ডাউনলোড লিংক চালু করা হয়েছে! ব্রাউজারের নতুন ট্যাব বা ডাউনলোড ম্যানেজার দেখুন।</span>
          </div>
        )}
      </div>

      {/* Real Available Download Servers */}
      {resolvedServers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {resolvedServers.map((srv) => (
            <div
              key={srv.id}
              className="bg-[#101117] hover:bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/60 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between gap-4 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    {getServerIcon(srv.serverType)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-white truncate">
                      {srv.serverName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                      {srv.quality && (
                        <span className="font-bold text-amber-400">{srv.quality}</span>
                      )}
                      {srv.resolution && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{srv.resolution}</span>
                        </>
                      )}
                      {srv.fileSize && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-semibold">{srv.fileSize}</span>
                        </>
                      )}
                      {srv.language && (
                        <>
                          <span>·</span>
                          <span className="truncate">{srv.language}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase shrink-0 ${getServerBadgeColor(
                    srv.serverType
                  )}`}
                >
                  {srv.serverType}
                </span>
              </div>

              <a
                href={srv.url}
                target="_blank"
                rel="noopener noreferrer"
                download={srv.isCloudPortal ? undefined : `${media.title.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_')}.mp4`}
                onClick={() => handleTrackDownload(srv)}
                className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform cursor-pointer touch-manipulation"
              >
                {srv.isCloudPortal ? (
                  <>
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                    <span>ডাউনলোড করুন ({srv.quality ? `${srv.quality} · ${srv.serverName}` : srv.serverName})</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>সরাসরি ডাউনলোড ({srv.quality || 'MP4'})</span>
                  </>
                )}
              </a>
            </div>
          ))}
        </div>
      ) : seriesEpisodes.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#101117] border border-zinc-800 text-center space-y-2">
          <AlertCircle className="w-7 h-7 text-zinc-500 mx-auto" />
          <p className="text-sm font-bold text-zinc-300">
            এই মুভির ডাউনলোড লিংক এখনো যুক্ত করা হয়নি।
          </p>
          <p className="text-xs text-zinc-500">
            অ্যাডমিন প্যানেল থেকে Google Drive, MEGA অথবা Direct MP4 লিংক যোগ করলে এখানে স্বয়ংক্রিয়ভাবে দেখাবে।
          </p>
        </div>
      ) : null}

      {/* Series Episodes Download / Server List (if Series) */}
      {seriesEpisodes.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Tv className="w-4 h-4 text-amber-400" />
            <span>এপিসোড ও সার্ভার সমূহ ({seriesEpisodes.length})</span>
          </div>
          <div className="space-y-2.5">
            {seriesEpisodes.map((ep) => {
              const epServers = (ep.videoServers || []).filter(
                (s) =>
                  normalizeUrl(s.streamUrl) &&
                  s.status !== 'broken' &&
                  !isDisallowedServerType(s.serverType)
              );
              return (
                <div
                  key={ep.id}
                  className="bg-[#101117] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-black text-amber-400">
                      Season {ep.seasonNumber} · Episode {ep.episodeNumber}
                    </div>
                    <div className="text-sm font-bold text-white">{ep.title}</div>
                    {ep.duration && (
                      <div className="text-[11px] text-zinc-400 mt-0.5">{ep.duration}</div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {epServers.length > 0 ? (
                      epServers.map((s, idx) => (
                        <a
                          key={s.id || idx}
                          href={
                            s.serverType === 'gdrive'
                              ? getGoogleDriveDownloadUrl(s.streamUrl)
                              : s.streamUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{s.serverName || s.quality || `Server ${idx + 1}`}</span>
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500">সার্ভার লিংক নেই</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
