import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { Users, Search, Shield, Ban, CheckCircle2, AlertTriangle, Key, Smartphone, Monitor, Tv } from 'lucide-react';

interface ManageUsersProps {
  users: UserProfile[];
  currentAdminEmail: string;
  onUpdateUser: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
}

export const ManageUsers: React.FC<ManageUsersProps> = ({
  users,
  currentAdminEmail,
  onUpdateUser,
}) => {
  const [search, setSearch] = useState('');
  const [loadingUid, setLoadingUid] = useState<string | null>(null);

  const handleToggleBan = async (targetUser: UserProfile) => {
    if (targetUser.email === 'imdshofiqul863@gmail.com') {
      alert('The primary system super administrator cannot be banned.');
      return;
    }
    const newBanState = !targetUser.isBanned;
    if (confirm(`${newBanState ? 'Suspend and ban' : 'Unban and reactivate'} user ${targetUser.email}?`)) {
      setLoadingUid(targetUser.uid);
      try {
        await onUpdateUser(targetUser.uid, { isBanned: newBanState });
      } catch (err: any) {
        alert(`Failed to update ban status: ${err.message}`);
      } finally {
        setLoadingUid(null);
      }
    }
  };

  const handleRoleChange = async (targetUser: UserProfile, newRole: UserRole) => {
    if (targetUser.email === 'imdshofiqul863@gmail.com') {
      alert('Primary super administrator role cannot be modified.');
      return;
    }
    setLoadingUid(targetUser.uid);
    try {
      await onUpdateUser(targetUser.uid, { role: newRole });
    } catch (err: any) {
      alert(`Failed to update role: ${err.message}`);
    } finally {
      setLoadingUid(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">ইউজার ম্যানেজমেন্ট ও ডিভাইস তালিকা</h1>
          <p className="text-xs text-zinc-400">
            নিবন্ধিত ব্যবহারকারীদের মোবাইল, কম্পিউটার ও স্মার্ট টিভি ডিভাইস ডিটেইলস এবং রোল ম্যানেজমেন্ট।
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Device & Platform</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.map((u, idx) => {
              const isSuper = u.email === 'imdshofiqul863@gmail.com' || u.role === 'superadmin';
              const initialLetter = ((u.displayName || u.email || 'U')[0] || 'U').toUpperCase();
              return (
                <tr key={`admin-user-row-${u.uid || idx}`} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.displayName || 'User'} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                          {initialLetter}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{u.displayName || u.email || 'CineBox Viewer'}</span>
                          {isSuper && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono font-bold">
                              ROOT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">{u.email || 'No email provided'}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {u.loginHistory && u.loginHistory[0]?.userAgent?.toLowerCase().includes('mobile') ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-red-400 text-[11px] font-semibold">
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Mobile (Android/iOS)</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-sky-400 text-[11px] font-semibold">
                          <Monitor className="w-3.5 h-3.5" />
                          <span>Desktop / Computer</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      disabled={isSuper || loadingUid === u.uid}
                      value={u.role || 'user'}
                      onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                      className={`bg-zinc-800 border rounded-lg px-2 py-1 text-xs font-semibold ${
                        u.role === 'superadmin'
                          ? 'border-red-500/50 text-red-400'
                          : u.role === 'admin'
                          ? 'border-purple-500/50 text-purple-400'
                          : u.role === 'editor'
                          ? 'border-blue-500/50 text-blue-400'
                          : 'border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <option value="user">User / Viewer</option>
                      <option value="editor">Content Editor</option>
                      <option value="admin">Administrator</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isBanned
                          ? 'bg-red-950/60 text-red-400 border border-red-800/60'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      }`}
                    >
                      {u.isBanned ? 'Suspended / Banned' : 'Active Account'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                    {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleBan(u)}
                      disabled={isSuper || loadingUid === u.uid}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        u.isBanned
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white border border-red-900/40'
                      } disabled:opacity-30`}
                    >
                      {u.isBanned ? 'Reactivate' : 'Ban User'}
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
