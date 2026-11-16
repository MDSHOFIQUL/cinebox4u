import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Terminal,
  Activity,
  HardDrive,
  FileCode,
  Zap,
} from 'lucide-react';
import { Movie, Series, VideoQuality } from '../../types';

export interface TranscodeJob {
  id: string;
  mediaId: string;
  mediaTitle: string;
  mediaType: 'movie' | 'episode';
  sourceUrl: string;
  renditions: VideoQuality[];
  status: 'queued' | 'transcoding' | 'completed' | 'failed';
  progress: number;
  speed: string;
  fps: number;
  etaSeconds: number;
  outputPlaylistUrl?: string;
  createdAt: string;
  logs: string[];
}

const INITIAL_JOBS: TranscodeJob[] = [
  {
    id: 'job-1094',
    mediaId: 'movie-1',
    mediaTitle: 'Oppenheimer',
    mediaType: 'movie',
    sourceUrl: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    renditions: ['4K', '1080p', '720p', '480p'],
    status: 'transcoding',
    progress: 74,
    speed: '2.8x',
    fps: 68,
    etaSeconds: 42,
    createdAt: new Date(Date.now() - 120000).toISOString(),
    logs: [
      '[ffmpeg] Input #0, mov,mp4,m4a,3gp from source master',
      '[ffmpeg] Duration: 03:00:21.04, bitrate: 18450 kb/s',
      '[ffmpeg] Stream #0:0: Video: h264 (High), yuv420p, 3840x2160 [SAR 1:1 DAR 16:9]',
      '[ffmpeg] Stream #0:1: Audio: aac (LC), 48000 Hz, 5.1(side), fltp, 384 kb/s',
      '[hls] Segmenter generating 6s chunks with AES-128 token authentication',
      '[hls] Chunk 410/550 generated at 4K rendition',
    ],
  },
  {
    id: 'job-1093',
    mediaId: 'movie-2',
    mediaTitle: 'Inception',
    mediaType: 'movie',
    sourceUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    renditions: ['1080p', '720p', '480p'],
    status: 'completed',
    progress: 100,
    speed: '3.4x',
    fps: 82,
    etaSeconds: 0,
    outputPlaylistUrl: 'https://cdn.cinebox4u.com/hls/movies/movie-2/master.m3u8',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    logs: [
      '[ffmpeg] Encoding completed successfully with 0 dropped frames',
      '[hls] Master multi-bitrate playlist written: 1080p, 720p, 480p renditions verified',
    ],
  },
];

interface TranscodeQueueProps {
  movies: Movie[];
  series: Series[];
}

export const TranscodeQueue: React.FC<TranscodeQueueProps> = ({ movies, series }) => {
  const [jobs, setJobs] = useState<TranscodeJob[]>(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState<TranscodeJob | null>(INITIAL_JOBS[0]);
  const [showNewJobModal, setShowNewJobModal] = useState(false);

  // New Job Form State
  const [newMediaId, setNewMediaId] = useState(movies[0]?.id || '');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [selectedRenditions, setSelectedRenditions] = useState<VideoQuality[]>(['1080p', '720p', '480p']);

  // Simulate progress on active transcoding jobs
  useEffect(() => {
    const timer = setInterval(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.status === 'transcoding') {
            const nextProgress = Math.min(100, job.progress + 2);
            const isDone = nextProgress >= 100;
            return {
              ...job,
              progress: nextProgress,
              status: isDone ? 'completed' : 'transcoding',
              etaSeconds: isDone ? 0 : Math.max(0, job.etaSeconds - 2),
              outputPlaylistUrl: isDone
                ? `https://cdn.cinebox4u.com/hls/${job.mediaId}/master.m3u8`
                : job.outputPlaylistUrl,
              logs: isDone
                ? [...job.logs, `[hls] Transcoding finalized. Master manifest uploaded to CDN.`]
                : job.logs,
            };
          }
          return job;
        })
      );
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const handleCreateJob = () => {
    const chosenMovie = movies.find((m) => m.id === newMediaId);
    const title = chosenMovie?.title || 'Custom Video Ingest';
    const source = newSourceUrl || chosenMovie?.videoServers?.[0]?.streamUrl || 'https://vjs.zencdn.net/v/oceans.mp4';

    const newJob: TranscodeJob = {
      id: `job-${Date.now().toString().slice(-4)}`,
      mediaId: newMediaId,
      mediaTitle: title,
      mediaType: 'movie',
      sourceUrl: source,
      renditions: selectedRenditions,
      status: 'transcoding',
      progress: 5,
      speed: '2.5x',
      fps: 60,
      etaSeconds: 95,
      createdAt: new Date().toISOString(),
      logs: [
        `[ffmpeg] Ingesting master asset for ${title}`,
        `[ffmpeg] Preparing multi-variant HLS rendition ladder: ${selectedRenditions.join(', ')}`,
        `[ffmpeg] Codec pipeline: H.264 (libx264) + AAC-LC audio passthrough`,
      ],
    };

    setJobs([newJob, ...jobs]);
    setSelectedJob(newJob);
    setShowNewJobModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              HLS Transcoding & Ingest Engine
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Automated multi-bitrate HLS segmentation ladder, AAC audio muxing, and CDN manifest distribution
          </p>
        </div>

        <button
          onClick={() => setShowNewJobModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-950/60 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Transcode Task</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Active Workers</span>
          <div className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>4 Dedicated VCPUs</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total Enqueued</span>
          <div className="text-xl font-black text-white mt-1">{jobs.length} Jobs</div>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Completed Assets</span>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {jobs.filter((j) => j.status === 'completed').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Transcode Format</span>
          <div className="text-xl font-black text-amber-400 mt-1">HLS / M3U8</div>
        </div>
      </div>

      {/* Main Grid: Queue on Left, Live Logs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
            Active & Recent Ingest Jobs
          </h3>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedJob?.id === job.id
                    ? 'bg-zinc-900 border-red-500 shadow-md shadow-red-950/20'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-400">{job.id}</span>
                    <span className="text-sm font-bold text-white">{job.mediaTitle}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      job.status === 'completed'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : job.status === 'transcoding'
                        ? 'bg-red-950/80 text-red-400 border border-red-800/60 flex items-center gap-1.5'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {job.status === 'transcoding' && (
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    )}
                    {job.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        job.status === 'completed'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-red-600 to-amber-500'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>
                      {job.progress}% {job.status === 'transcoding' && `(${job.speed}, ${job.fps} fps)`}
                    </span>
                    <span>
                      {job.status === 'transcoding'
                        ? `ETA: ${job.etaSeconds}s`
                        : job.status === 'completed'
                        ? 'Finished'
                        : 'Queued'}
                    </span>
                  </div>
                </div>

                {/* Renditions list */}
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="text-[10px] text-zinc-500">Profiles:</span>
                  {job.renditions.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-800 text-zinc-300"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live FFmpeg Terminal Log Inspector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-red-400" />
              <span>Transcode Terminal Logs</span>
            </h3>
            {selectedJob && (
              <span className="text-[10px] font-mono text-zinc-500">{selectedJob.id}</span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-black border border-zinc-800 font-mono text-[11px] text-zinc-300 h-96 overflow-y-auto space-y-1.5 shadow-inner">
            {selectedJob?.logs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-zinc-600 mr-2">[{i + 1}]</span>
                <span
                  className={
                    log.includes('successfully') || log.includes('verified')
                      ? 'text-emerald-400'
                      : log.includes('error')
                      ? 'text-red-400'
                      : 'text-zinc-300'
                  }
                >
                  {log}
                </span>
              </div>
            ))}

            {selectedJob?.outputPlaylistUrl && (
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <span className="text-emerald-400 font-bold block mb-1">
                  ✓ Output Master Manifest URL:
                </span>
                <span className="text-zinc-400 break-all select-all bg-zinc-950 p-2 rounded block border border-zinc-800 text-[10px]">
                  {selectedJob.outputPlaylistUrl}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ingest Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-white">Create Video Transcode Task</h3>
            <p className="text-xs text-zinc-400">
              Select an item from the catalog or supply a source MP4/ProRes file to segment into multi-bitrate HLS.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Select Media</label>
                <select
                  value={newMediaId}
                  onChange={(e) => setNewMediaId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.releaseYear})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Source MP4 / Ingest URL</label>
                <input
                  type="url"
                  placeholder="https://storage.googleapis.com/.../master.mp4"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Target Rendition Ladder
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['4K', '1080p', '720p', '480p', '360p'] as VideoQuality[]).map((q) => (
                    <button
                      type="button"
                      key={q}
                      onClick={() =>
                        setSelectedRenditions((prev) =>
                          prev.includes(q) ? prev.filter((item) => item !== q) : [...prev, q]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                        selectedRenditions.includes(q)
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowNewJobModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-red-950/60"
              >
                Start Ingest Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
