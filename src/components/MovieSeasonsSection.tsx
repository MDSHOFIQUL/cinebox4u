import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Download, X, Layers, Clapperboard, SkipForward, ExternalLink, AlertCircle } from 'lucide-react';
import { Movie, MovieSeason, MovieEpisode, SeasonGroup } from '../types';

interface MovieSeasonsSectionProps {
  movie: Movie;
}

type LinkKind = 'youtube' | 'gdrive' | 'mega' | 'hls' | 'file';

function clean(url?: string): string {
  const t = (url || '').trim();
  return t && t !== '#' ? t : '';
}

function classify(url: string): LinkKind {
  const u = url.toLowerCase();
  if (/youtu\.be\/|youtube\.com\//.test(u)) return 'youtube';
  if (u.includes('drive.google.com')) return 'gdrive';
  if (u.includes('mega.nz') || u.includes('mega.io')) return 'mega';
  if (u.includes('.m3u8')) return 'hls';
  return 'file';
}

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&autoplay=1` : null;
}

function driveId(url: string): string | null {
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function driveDownload(url: string): string {
  const id = driveId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}&confirm=t` : url;
}

const seasonLabel = (s: MovieSeason) => `${s.kind === 'season' ? 'Season' : 'Part'} ${s.number}`;

const sortSeasons = (list: MovieSeason[]) =>
  [...list].sort((a, b) => (a.kind === b.kind ? a.number - b.number : a.kind === 'season' ? -1 : 1));

/** Plays one episode link inline: mp4 / m3u8 (HLS) / YouTube / Google Drive preview. */
const EpisodePlayer: React.FC<{ url: string; poster?: string }> = ({ url, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const kind = classify(url);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    if (kind !== 'hls' && kind !== 'file') return;
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: { destroy: () => void } | null = null;
    let cancelled = false;

    if (kind === 'hls' && !video.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js')
        .then(({ default: Hls }) => {
          if (cancelled) return;
          if (Hls.isSupported()) {
            const hls = new Hls();
            hlsInstance = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal?: boolean }) => {
              if (data?.fatal) setFailed(true);
            });
          } else {
            setFailed(true);
          }
        })
        .catch(() => setFailed(true));
    } else {
      video.src = url;
    }

    video.play().catch(() => {
      /* autoplay may be blocked; user can press play */
    });

    return () => {
      cancelled = true;
      if (hlsInstance) hlsInstance.destroy();
    };
  }, [url, kind]);

  if (kind === 'mega') {
    return (
      <div className="aspect-video w-full rounded-2xl bg-black border border-zinc-800 flex flex-col items-center justify-center gap-3 text-center p-4">
        <AlertCircle className="w-6 h-6 text-amber-400" />
        <p className="text-xs text-zinc-300">MEGA লিংক এখানে সরাসরি চালানো যায় না। নতুন ট্যাবে খুলুন।</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>MEGA তে খুলুন</span>
        </a>
      </div>
    );
  }

  if (kind === 'youtube') {
    const src = youtubeEmbed(url);
    if (src) {
      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">
          <iframe
            src={src}
            title="Episode player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      );
    }
  }

  if (kind === 'gdrive') {
    const id = driveId(url);
    if (id) {
      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">
          <iframe
            src={`https://drive.google.com/file/d/${id}/preview`}
            title="Episode player"
            allow="autoplay; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      );
    }
  }

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        onError={() => setFailed(true)}
        className="w-full h-full object-contain"
      />
      {failed && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 text-center p-4">
          <AlertCircle className="w-6 h-6 text-amber-400" />
          <p className="text-xs text-zinc-300">এই লিংকটি এখানে চালানো যাচ্ছে না। নতুন ট্যাবে খুলে দেখুন।</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>লিংক খুলুন</span>
          </a>
        </div>
      )}
    </div>
  );
};

const GroupBlock: React.FC<{ movie: Movie; group: SeasonGroup; seasons: MovieSeason[] }> = ({
  movie,
  group,
  seasons,
}) => {
  const ordered = useMemo(() => sortSeasons(seasons), [seasons]);
  const [activeId, setActiveId] = useState<string>(ordered[0]?.id || '');
  const [playing, setPlaying] = useState<{ seasonId: string; epId: string } | null>(null);

  useEffect(() => {
    if (!ordered.some((s) => s.id === activeId)) setActiveId(ordered[0]?.id || '');
    setPlaying(null);
  }, [movie.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = ordered.find((s) => s.id === activeId) || ordered[0];
  if (!active) return null;

  const episodes = [...active.episodes].sort((a, b) => a.number - b.number);
  const totalEpisodes = ordered.reduce((n, s) => n + s.episodes.length, 0);
  const nowPlaying =
    playing && playing.seasonId === active.id ? episodes.find((e) => e.id === playing.epId) : undefined;
  const nowIdx = nowPlaying ? episodes.findIndex((e) => e.id === nowPlaying.id) : -1;
  const nextWatchable = nowIdx >= 0 ? episodes.slice(nowIdx + 1).find((e) => clean(e.streamUrl)) : undefined;

  const Icon = group === 'series' ? Layers : Clapperboard;
  const groupTitle = group === 'series' ? 'Seasons & Episodes' : 'Cartoon Series Parts';
  const groupSub = group === 'series' ? 'সিজন ও সিরিজ এপিসোড' : 'কার্টুন সিরিজ পার্ট';

  const renderEpisode = (ep: MovieEpisode) => {
    const watchUrl = clean(ep.streamUrl);
    const dlRaw = clean(ep.downloadUrl);
    const dlKind = dlRaw ? classify(dlRaw) : 'file';
    const dlUrl = dlKind === 'gdrive' ? driveDownload(dlRaw) : dlRaw;
    const isCloud = dlKind === 'mega' || dlKind === 'gdrive';
    const isPlayingThis = nowPlaying?.id === ep.id;

    return (
      <div
        key={ep.id}
        className={`flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-2xl border p-3 transition-colors ${
          isPlayingThis ? 'bg-red-950/30 border-red-500/50' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-black text-white shrink-0 tabular-nums">
          {ep.number}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white truncate">{ep.title?.trim() || `Episode ${ep.number}`}</h4>
          <p className="text-[11px] text-zinc-500 truncate">
            {seasonLabel(active)} · Episode {ep.number}
            {ep.fileSize ? ` · ${ep.fileSize}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {watchUrl && (
            <button
              type="button"
              onClick={() => setPlaying({ seasonId: active.id, epId: ep.id })}
              className="min-h-[40px] px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer touch-manipulation"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>দেখুন</span>
            </button>
          )}
          {dlUrl && (
            <a
              href={dlUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={isCloud ? undefined : ''}
              className="min-h-[40px] px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 transition touch-manipulation"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ডাউনলোড</span>
            </a>
          )}
          {!watchUrl && !dlUrl && <span className="text-[11px] text-zinc-600">শীঘ্রই আসছে</span>}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-[#101117] border border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-950/60 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{groupTitle}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {movie.title} — {groupSub}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800 text-xs font-bold text-amber-400 w-fit tabular-nums">
          <span>
            {ordered.length} টি {group === 'series' ? 'সিজন' : 'পার্ট/সিজন'} · {totalEpisodes} টি এপিসোড প্রকাশিত
          </span>
        </div>
      </div>

      {/* Season / Part tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {ordered.map((s) => {
          const isActive = s.id === active.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveId(s.id);
                setPlaying(null);
              }}
              className={`shrink-0 min-h-[44px] px-4 rounded-2xl border text-xs font-bold transition cursor-pointer touch-manipulation ${
                isActive
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600'
              }`}
            >
              <span>{seasonLabel(s)}</span>
              <span className={`ml-2 tabular-nums ${isActive ? 'text-red-100' : 'text-zinc-500'}`}>
                {s.episodes.length} EP
              </span>
            </button>
          );
        })}
      </div>

      {/* Release count for the selected season / part */}
      <p className="text-xs text-zinc-300">
        <span className="font-bold text-white">
          {seasonLabel(active)}
          {active.title ? ` — ${active.title}` : ''}
        </span>
        <span className="text-emerald-400 font-semibold">
          {' '}
          · এখন পর্যন্ত {episodes.length} টি এপিসোড প্রকাশিত হয়েছে
        </span>
      </p>

      {/* Inline player */}
      {nowPlaying && clean(nowPlaying.streamUrl) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-white truncate">
              {seasonLabel(active)} · Episode {nowPlaying.number}
              {nowPlaying.title ? ` — ${nowPlaying.title}` : ''}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {nextWatchable && (
                <button
                  type="button"
                  onClick={() => setPlaying({ seasonId: active.id, epId: nextWatchable.id })}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>পরের এপিসোড</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPlaying(null)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 cursor-pointer"
                aria-label="Close player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <EpisodePlayer
            key={nowPlaying.id}
            url={clean(nowPlaying.streamUrl)}
            poster={movie.backdropUrl || movie.posterUrl}
          />
        </div>
      )}

      {/* Episodes */}
      {episodes.length > 0 ? (
        <div className="space-y-2.5">{episodes.map(renderEpisode)}</div>
      ) : (
        <p className="text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl px-4 py-5 text-center">
          এই {seasonLabel(active)} এর এপিসোড শীঘ্রই আসছে।
        </p>
      )}
    </section>
  );
};

export const MovieSeasonsSection: React.FC<MovieSeasonsSectionProps> = ({ movie }) => {
  const seasons = (movie.seasons || []).filter((s) => s && Array.isArray(s.episodes));
  if (seasons.length === 0) return null;

  const series = seasons.filter((s) => s.group === 'series');
  const cartoon = seasons.filter((s) => s.group === 'cartoon');

  return (
    <div id="seasons-episodes-section" className="space-y-6 scroll-mt-24">
      {series.length > 0 && <GroupBlock movie={movie} group="series" seasons={series} />}
      {cartoon.length > 0 && <GroupBlock movie={movie} group="cartoon" seasons={cartoon} />}
    </div>
  );
};
