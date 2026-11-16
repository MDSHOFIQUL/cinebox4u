import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { Settings, Save, Check, AlertTriangle, Bell, ExternalLink } from 'lucide-react';

interface WebsiteSettingsProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

function normalizeTelegramUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed === 'https://t.me/cinebox4u' || trimmed === 'https://t.me') return '';
  if (trimmed.startsWith('@')) {
    return `https://t.me/${trimmed.slice(1)}`;
  }
  if (trimmed.startsWith('t.me/')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export const WebsiteSettings: React.FC<WebsiteSettingsProps> = ({ settings, onSaveSettings }) => {
  const [siteName, setSiteName] = useState(settings.siteName || 'CineBox4u');
  const [description, setDescription] = useState(settings.description || '');
  const [announcement, setAnnouncement] = useState(settings.announcement || '');
  const [announcementActive, setAnnouncementActive] = useState(settings.announcementActive !== false);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode === true);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || 'support@cinebox4u.com');
  const [contactTelegram, setContactTelegram] = useState(
    normalizeTelegramUrl(settings.contactTelegram || settings.socialLinks?.telegram || '')
  );
  const [twitter, setTwitter] = useState(settings.socialLinks?.twitter || 'https://twitter.com');
  const [discord, setDiscord] = useState(settings.socialLinks?.discord || 'https://discord.com');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSiteName(settings.siteName || 'CineBox4u');
    setDescription(settings.description || '');
    setAnnouncement(settings.announcement || '');
    setAnnouncementActive(settings.announcementActive !== false);
    setMaintenanceMode(settings.maintenanceMode === true);
    setContactEmail(settings.contactEmail || 'support@cinebox4u.com');
    setContactTelegram(
      normalizeTelegramUrl(settings.contactTelegram || settings.socialLinks?.telegram || '')
    );
    setTwitter(settings.socialLinks?.twitter || 'https://twitter.com');
    setDiscord(settings.socialLinks?.discord || 'https://discord.com');
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const normalizedTelegram = normalizeTelegramUrl(contactTelegram);

    const payload: SiteSettings = {
      ...settings,
      siteName,
      description,
      announcement,
      announcementActive,
      maintenanceMode,
      contactEmail,
      contactTelegram: normalizedTelegram,
      socialLinks: {
        twitter,
        discord,
        telegram: normalizedTelegram,
      },
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveSettings(payload);
      setContactTelegram(normalizedTelegram);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      alert(`Error saving settings: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const previewTelegram = normalizeTelegramUrl(contactTelegram);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Website & System Settings</h1>
        <p className="text-xs text-zinc-400">
          Manage branding, broadcast announcements, emergency maintenance mode, and community links.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Website settings updated in Firestore!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Branding */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800">
            <Settings className="w-4 h-4 text-red-500" />
            <span>Platform Branding</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">Website Name</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">Support Contact Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">SEO Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
            />
          </div>
        </div>

        {/* Global Announcement Banner */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Broadcast Announcement</span>
            </h2>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                className="accent-red-600 rounded"
              />
              <span>Display Live Banner</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
              Banner Message
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. 🔥 New 4K HDR releases are now available!"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Maintenance Mode Emergency Switch */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Maintenance Mode</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                When activated, non-administrative visitors will see an under-maintenance screen.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-red-600 rounded"
              />
              <span className={`text-xs font-black uppercase ${maintenanceMode ? 'text-red-500' : 'text-zinc-500'}`}>
                {maintenanceMode ? 'ACTIVE (LOCKED)' : 'DISABLED'}
              </span>
            </label>
          </div>
        </div>

        {/* Social Links */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-zinc-800">
            Community & Social Media Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-400">
                  Telegram Channel / Group Link
                </label>
                {previewTelegram && (
                  <a
                    href={previewTelegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <span>Test</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={contactTelegram}
                onChange={(e) => setContactTelegram(e.target.value)}
                placeholder="https://t.me/your_channel অথবা @username"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                এখানে আপনার আসল টেলিগ্রাম লিংক দিলে ওয়েবসাইটের ফ্লোটিং বাটন সরাসরি সেখানেই নিয়ে যাবে।
              </p>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Twitter / X Profile</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Discord Server</label>
              <input
                type="url"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-red-950/80 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Website Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
