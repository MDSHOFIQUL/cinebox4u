import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Film,
  PlusCircle,
  Tv,
  Layers,
  FolderTree,
  Globe2,
  Server,
  Users,
  BarChart3,
  Settings,
  Shield,
  FileSpreadsheet,
  History,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Bell,
  HardDrive,
  FileCode,
} from 'lucide-react';

export type AdminSection =
  | 'dashboard'
  | 'html-file'
  | 'add-movie'
  | 'movies'
  | 'firebase-sync'
  | 'notices'
  | 'video-storage'
  | 'add-series'
  | 'series'
  | 'episodes'
  | 'categories'
  | 'languages'
  | 'servers'
  | 'transcoding'
  | 'users'
  | 'homepage'
  | 'approvals'
  | 'subtitles'
  | 'licensing'
  | 'subscriptions'
  | 'support'
  | 'bulk'
  | 'reports'
  | 'logs'
  | 'settings'
  | 'profile';

interface AdminLayoutProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onBackToSite: () => void;
  onSeedData: () => Promise<void>;
  isSeeding: boolean;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onSelectSection,
  onBackToSite,
  onSeedData,
  isSeeding,
  children,
}) => {
  const { user, profile, role, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'html-file', label: 'HTML ফাইল (Admin Only)', icon: FileCode, badge: 'OFFLINE' },
    { id: 'add-movie', label: 'Add Movie', icon: PlusCircle },
    { id: 'movies', label: 'ট্যাব ১: মুভি ম্যানেজমেন্ট', icon: Film, badge: 'LIVE' },
    { id: 'firebase-sync', label: 'ট্যাব ৫: ফায়ারবেস লাইভ সিঙ্ক', icon: Database, badge: '100% LIVE' },
    { id: 'notices', label: 'নোটিশ (Notices)', icon: Bell, badge: 'BROADCAST' },
    { id: 'video-storage', label: 'Video Storage Portal', icon: HardDrive, badge: 'MEGA/GD' },
    { id: 'add-series', label: 'Add Series', icon: PlusCircle },
    { id: 'series', label: 'Manage Series', icon: Tv },
    { id: 'episodes', label: 'Episodes Manager', icon: Layers },
    { id: 'categories', label: 'Categories & Genres', icon: FolderTree },
    { id: 'languages', label: 'Languages', icon: Globe2 },
    { id: 'servers', label: 'Video Servers & Links', icon: Server, badge: 'TESTER' },
    { id: 'transcoding', label: 'HLS Transcoder & Ingest', icon: Cpu, badge: 'AUTO' },
    { id: 'homepage', label: 'Homepage Builder', icon: FolderTree },
    { id: 'approvals', label: 'Content Approvals', icon: CheckCircle2, badge: 'NEW' },
    { id: 'subtitles', label: 'WebVTT Subtitles', icon: Film },
    { id: 'licensing', label: 'Licensing & Expiration', icon: Shield },
    { id: 'support', label: 'Support Help Desk', icon: Users },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'bulk', label: 'Bulk Movie & CSV', icon: FileSpreadsheet },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'logs', label: 'Admin Activity Logs', icon: History },
    { id: 'settings', label: 'Website Settings', icon: Settings },
  ];

  const handleSeed = async () => {
    try {
      await onSeedData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0e14] border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Brand Header */}
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-950/60 border border-red-500/40">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white flex items-center">
                  CINE<span className="text-red-500">BOX</span>
                  <span className="ml-1 text-[10px] bg-red-600/30 text-red-400 px-1 rounded border border-red-500/30 font-mono">
                    ADMIN
                  </span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold block">
                  Command Center
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id as AdminSection);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-950/50 font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-zinc-800 text-red-400 font-mono font-bold border border-zinc-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom user profile & actions */}
          <div className="p-3 border-t border-zinc-800/80 space-y-2 bg-zinc-950/40">
            {/* Quick database seed button */}
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2 transition hover:border-red-500/30"
              title="Populate or sync sample movies and categories to Firestore"
            >
              <Database className="w-3.5 h-3.5 text-red-500" />
              <span>{isSeeding ? 'Syncing...' : seedSuccess ? 'Database Synced!' : 'Sync Firestore DB'}</span>
            </button>

            {/* Admin identity */}
            <div className="p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {profile?.displayName || user?.displayName || 'Administrator'}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono truncate">{user?.email}</p>
                <span className="text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-950/60 px-1.5 py-0.2 rounded border border-red-800/60 mt-1 inline-block">
                  {role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onBackToSite}
                className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Site</span>
              </button>
              <button
                onClick={() => logout()}
                className="py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white text-[11px] font-medium transition"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#07080b]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-extrabold text-white capitalize">
              {currentSection.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firestore Active</span>
            </div>

            <button
              onClick={onBackToSite}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Go to CineBox4u</span>
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
