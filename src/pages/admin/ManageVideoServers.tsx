import React, { useState } from 'react';
import { Movie, Episode, VideoServer } from '../../types';
import { Server, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, Zap, ShieldAlert } from 'lucide-react';
import { testStreamLink } from '../../services/dataService';

interface ManageVideoServersProps {
  movies: Movie[];
  episodes: Episode[];
  onUpdateMovie: (movie: Movie) => Promise<void>;
}

interface ServerTestStatus {
  status: 'pending' | 'testing' | 'active' | 'broken';
  latencyMs?: number;
  message?: string;
}

export const ManageVideoServers: React.FC<ManageVideoServersProps> = ({
  movies,
  episodes,
  onUpdateMovie,
}) => {
  const [testResults, setTestResults] = useState<{ [serverId: string]: ServerTestStatus }>({});
  const [isBatchTesting, setIsBatchTesting] = useState(false);

  // Extract all video server items
  const allServerRows: {
    server: VideoServer;
    parentTitle: string;
    parentType: 'movie' | 'episode';
    parentItem: Movie | Episode;
  }[] = [];

  movies.forEach((m) => {
    m.videoServers?.forEach((s) => {
      allServerRows.push({
        server: s,
        parentTitle: m.title,
        parentType: 'movie',
        parentItem: m,
      });
    });
  });

  episodes.forEach((ep) => {
    ep.videoServers?.forEach((s) => {
      allServerRows.push({
        server: s,
        parentTitle: `Episode ${ep.episodeNumber}: ${ep.title}`,
        parentType: 'episode',
        parentItem: ep,
      });
    });
  });

  const runTest = async (serverId: string, url: string, type: string) => {
    setTestResults((prev) => ({
      ...prev,
      [serverId]: { status: 'testing' },
    }));

    const res = await testStreamLink(url, type);

    setTestResults((prev) => ({
      ...prev,
      [serverId]: {
        status: res.success ? 'active' : 'broken',
        latencyMs: res.latencyMs,
        message: res.message,
      },
    }));
  };

  const runBatchTestAll = async () => {
    setIsBatchTesting(true);
    for (const row of allServerRows) {
      await runTest(row.server.id, row.server.streamUrl, row.server.serverType);
    }
    setIsBatchTesting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Video Server & Link Health Tester</h1>
          <p className="text-xs text-zinc-400">
            Automated stream link latency testing, broken mirror detection, and HLS endpoint validation.
          </p>
        </div>

        <button
          onClick={runBatchTestAll}
          disabled={isBatchTesting || allServerRows.length === 0}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isBatchTesting ? 'animate-spin' : ''}`} />
          <span>{isBatchTesting ? 'Scanning All Streams...' : 'Run Diagnostics on All Links'}</span>
        </button>
      </div>

      {/* Summary Diagnostics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total Configured Mirrors</span>
          <div className="text-xl font-black text-white mt-1">{allServerRows.length}</div>
        </div>

        <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400">HLS Adaptive Streams</span>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {allServerRows.filter((r) => r.server.serverType === 'hls').length}
          </div>
        </div>

        <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Direct MP4 Servers</span>
          <div className="text-xl font-black text-blue-400 mt-1">
            {allServerRows.filter((r) => r.server.serverType === 'direct').length}
          </div>
        </div>

        <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Google Drive & MEGA</span>
          <div className="text-xl font-black text-purple-400 mt-1">
            {allServerRows.filter((r) => ['gdrive', 'mega'].includes(r.server.serverType)).length}
          </div>
        </div>
      </div>

      {/* Servers Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Server Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Quality</th>
              <th className="py-3 px-4">Stream URL</th>
              <th className="py-3 px-4">Health Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {allServerRows.map(({ server, parentTitle, parentType }) => {
              const test = testResults[server.id];
              return (
                <tr key={server.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-white block truncate max-w-xs">{parentTitle}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">{parentType}</span>
                  </td>

                  <td className="py-3 px-4 font-semibold text-zinc-200">{server.serverName}</td>

                  <td className="py-3 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {server.serverType}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-zinc-400">{server.quality}</td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-zinc-400 truncate block max-w-xs">
                      {server.streamUrl}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {test?.status === 'testing' ? (
                      <span className="text-amber-400 text-[11px] flex items-center gap-1 font-mono">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Pinging...
                      </span>
                    ) : test?.status === 'active' ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active ({test.latencyMs}ms)</span>
                      </div>
                    ) : test?.status === 'broken' ? (
                      <div className="flex items-center gap-1.5 text-red-400 text-[11px] font-mono">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Broken: {test.message}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-[11px] font-mono">Untested</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => runTest(server.id, server.streamUrl, server.serverType)}
                      disabled={test?.status === 'testing'}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
                    >
                      Test Link
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
