import React, { useState } from 'react';
import { AdminLog } from '../../types';
import { History, Search, Shield, Filter, Download } from 'lucide-react';

interface AdminActivityLogsProps {
  adminLogs: AdminLog[];
}

export const AdminActivityLogs: React.FC<AdminActivityLogsProps> = ({ adminLogs }) => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filtered = adminLogs.filter((log) => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (
      search.trim() &&
      !log.details.toLowerCase().includes(search.toLowerCase()) &&
      !log.adminEmail.toLowerCase().includes(search.toLowerCase()) &&
      !log.action.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const uniqueActions = Array.from(new Set(adminLogs.map((l) => l.action)));

  const handleExportCSV = () => {
    const headers = ['id', 'timestamp', 'action', 'targetType', 'adminEmail', 'details'];
    const rows = filtered.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.targetType}"`,
      `"${l.adminEmail}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cinebox4u_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(filtered, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cinebox4u_audit_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Administrator Audit Logs</h1>
          <p className="text-xs text-zinc-400">
            Immutable tracking of all database modifications, role assignments, and system configurations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-red-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search logs by keyword, admin, entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="w-full sm:w-auto bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-3 py-2"
        >
          <option value="all">All Actions ({adminLogs.length})</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filtered.map((log, idx) => (
                <tr key={`admin-alert-${log.id || idx}`} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-red-950/50 text-red-400 border border-red-800/50">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-300 font-sans">{log.targetType}</td>
                  <td className="py-3 px-4 text-zinc-400 text-[11px] font-sans">
                    {log.adminEmail}
                  </td>
                  <td className="py-3 px-4 text-zinc-200 font-sans text-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-500 font-sans">
            No audit records matching your current filter.
          </div>
        )}
      </div>
    </div>
  );
};
