import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminLayout, AdminSection } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { ManageMovies } from './ManageMovies';
import { ManageSeries } from './ManageSeries';
import { ManageEpisodes } from './ManageEpisodes';
import { ManageCategories } from './ManageCategories';
import { ManageLanguages } from './ManageLanguages';
import { ManageVideoServers } from './ManageVideoServers';
import { ManageUsers } from './ManageUsers';
import { BulkMovieUpload } from './BulkMovieUpload';
import { WebsiteSettings } from './WebsiteSettings';
import { AdminActivityLogs } from './AdminActivityLogs';
import { HomepageBuilder } from './HomepageBuilder';
import { ContentApprovals } from './ContentApprovals';
import { SubtitleEditor } from './SubtitleEditor';
import { ContentLicensing } from './ContentLicensing';
import { SubscriptionManager } from './SubscriptionManager';
import { SupportTicketManager } from './SupportTicketManager';
import { TranscodeQueue } from './TranscodeQueue';
import { ManageNotices } from './ManageNotices';
import { VideoStoragePortal } from './VideoStoragePortal';
import { FirebaseLiveSync } from './FirebaseLiveSync';
import { ManageHtmlFile } from './ManageHtmlFile';
import {
  Movie,
  Series,
  Episode,
  Category,
  Language,
  SiteSettings,
  UserProfile,
  AdminLog,
} from '../../types';
import { BarChart3, TrendingUp, Eye, Film, Tv, Users, ShieldAlert } from 'lucide-react';

interface AdminPortalProps {
  onBackToSite: () => void;
  movies: Movie[];
  series: Series[];
  episodes: Episode[];
  categories: Category[];
  languages: Language[];
  settings: SiteSettings;
  users: UserProfile[];
  adminLogs: AdminLog[];
  onSaveMovie: (movie: Movie) => Promise<void>;
  onDeleteMovie: (movieId: string) => Promise<void>;
  onSaveSeries: (series: Series) => Promise<void>;
  onDeleteSeries: (seriesId: string) => Promise<void>;
  onSaveEpisode: (episode: Episode) => Promise<void>;
  onDeleteEpisode: (episodeId: string) => Promise<void>;
  onSaveCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onSaveLanguage: (language: Language) => Promise<void>;
  onDeleteLanguage: (languageId: string) => Promise<void>;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
  onUpdateUser: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  onImportBulkMovies: (movies: Movie[]) => Promise<void>;
  onSeedData: () => Promise<void>;
  isSeeding: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToSite,
  movies,
  series,
  episodes,
  categories,
  languages,
  settings,
  users,
  adminLogs,
  onSaveMovie,
  onDeleteMovie,
  onSaveSeries,
  onDeleteSeries,
  onSaveEpisode,
  onDeleteEpisode,
  onSaveCategory,
  onDeleteCategory,
  onSaveLanguage,
  onDeleteLanguage,
  onSaveSettings,
  onUpdateUser,
  onImportBulkMovies,
  onSeedData,
  isSeeding,
}) => {
  const { user, isAdmin, isEditor, role } = useAuth();
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // If not logged in, show dedicated Admin Login screen
  if (!user) {
    return <AdminLogin onBackToSite={onBackToSite} onLoginSuccess={() => setCurrentSection('dashboard')} />;
  }

  // If user is logged in but not admin/editor
  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Administrator Privileges Required</h2>
          <p className="text-xs text-zinc-400">
            Your authenticated account ({user.email}) does not have administrative authorization for CineBox4u.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={onBackToSite}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl"
            >
              Back to CineBox4u
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      currentSection={currentSection}
      onSelectSection={(sec) => {
        setEditingMovie(null);
        setCurrentSection(sec);
      }}
      onBackToSite={onBackToSite}
      onSeedData={onSeedData}
      isSeeding={isSeeding}
    >
      {currentSection === 'dashboard' && (
        <AdminDashboard
          movies={movies}
          series={series}
          episodes={episodes}
          categories={categories}
          users={users}
          adminLogs={adminLogs}
          onNavigateSection={(sec) => setCurrentSection(sec)}
          onEditMovie={(m) => {
            setEditingMovie(m);
            setCurrentSection('movies');
          }}
        />
      )}

      {currentSection === 'html-file' && (
        <ManageHtmlFile />
      )}

      {currentSection === 'add-movie' && (
        <ManageMovies
          movies={movies}
          categories={categories}
          languages={languages}
          onSaveMovie={onSaveMovie}
          onDeleteMovie={onDeleteMovie}
          editingMovie={null}
          onClearEditing={() => setEditingMovie(null)}
          openCreateForm={true}
        />
      )}

      {currentSection === 'movies' && (
        <ManageMovies
          movies={movies}
          categories={categories}
          languages={languages}
          onSaveMovie={onSaveMovie}
          onDeleteMovie={onDeleteMovie}
          editingMovie={editingMovie}
          onClearEditing={() => setEditingMovie(null)}
          onRefreshCloud={onSeedData}
        />
      )}

      {currentSection === 'firebase-sync' && (
        <FirebaseLiveSync
          movies={movies}
          series={series}
          categories={categories}
          languages={languages}
          settings={settings}
          onRefreshMovies={onSeedData}
        />
      )}

      {currentSection === 'notices' && (
        <ManageNotices
          settings={settings}
          onSaveSettings={onSaveSettings}
        />
      )}

      {currentSection === 'video-storage' && (
        <VideoStoragePortal />
      )}

      {currentSection === 'add-series' && (
        <ManageSeries
          series={series}
          categories={categories}
          languages={languages}
          onSaveSeries={onSaveSeries}
          onDeleteSeries={onDeleteSeries}
          openCreateForm={true}
        />
      )}

      {currentSection === 'series' && (
        <ManageSeries
          series={series}
          categories={categories}
          languages={languages}
          onSaveSeries={onSaveSeries}
          onDeleteSeries={onDeleteSeries}
        />
      )}

      {currentSection === 'episodes' && (
        <ManageEpisodes
          series={series}
          episodes={episodes}
          onSaveEpisode={onSaveEpisode}
          onDeleteEpisode={onDeleteEpisode}
        />
      )}

      {currentSection === 'categories' && (
        <ManageCategories
          categories={categories}
          onSaveCategory={onSaveCategory}
          onDeleteCategory={onDeleteCategory}
        />
      )}

      {currentSection === 'languages' && (
        <ManageLanguages
          languages={languages}
          onSaveLanguage={onSaveLanguage}
          onDeleteLanguage={onDeleteLanguage}
        />
      )}

      {currentSection === 'servers' && (
        <ManageVideoServers
          movies={movies}
          episodes={episodes}
          onUpdateMovie={onSaveMovie}
        />
      )}

      {currentSection === 'transcoding' && (
        <TranscodeQueue movies={movies} series={series} />
      )}

      {currentSection === 'users' && (
        <ManageUsers
          users={users}
          currentAdminEmail={user.email || ''}
          onUpdateUser={onUpdateUser}
        />
      )}

      {currentSection === 'bulk' && (
        <BulkMovieUpload movies={movies} onImportMovies={onImportBulkMovies} />
      )}

      {currentSection === 'homepage' && (
        <HomepageBuilder settings={settings} onSaveSettings={onSaveSettings} />
      )}

      {currentSection === 'approvals' && (
        <ContentApprovals
          movies={movies}
          series={series}
          onApproveItem={async (item) => {
            if (item.type === 'movie') {
              await onSaveMovie({ ...(item as Movie), published: true });
            } else {
              await onSaveSeries({ ...(item as Series), published: true });
            }
          }}
          onRejectItem={(item, reason) => {
            alert(`Draft rejection notice registered for "${item.title}": ${reason}`);
          }}
        />
      )}

      {currentSection === 'subtitles' && (
        <SubtitleEditor
          movies={movies}
          series={series}
          onSaveTrack={(mediaId, track) => {
            const targetMovie = movies.find((m) => m.id === mediaId);
            if (targetMovie) {
              const subs = [...(targetMovie.subtitles || []), track];
              onSaveMovie({ ...targetMovie, subtitles: subs });
            }
          }}
        />
      )}

      {currentSection === 'licensing' && (
        <ContentLicensing movies={movies} series={series} />
      )}

      {currentSection === 'subscriptions' && <SubscriptionManager />}

      {currentSection === 'support' && <SupportTicketManager />}

      {currentSection === 'settings' && (
        <WebsiteSettings settings={settings} onSaveSettings={onSaveSettings} />
      )}

      {currentSection === 'logs' && <AdminActivityLogs adminLogs={adminLogs} />}

      {currentSection === 'reports' && (
        <div className="space-y-6">
          <h1 className="text-xl sm:text-2xl font-black text-white">Streaming Analytics & Reports</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Total Stream Views</span>
              <div className="text-2xl font-black text-white mt-1">
                {(movies.reduce((acc, m) => acc + (m.viewsCount || 0), 0) +
                  series.reduce((acc, s) => acc + (s.viewsCount || 0), 0)).toLocaleString()}
              </div>
            </div>
            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Total Registered Users</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{users.length}</div>
            </div>
            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Average Movie Rating</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {(movies.reduce((acc, m) => acc + (m.rating || 0), 0) / (movies.length || 1)).toFixed(1)} / 10
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
