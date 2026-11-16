import React, { useState } from 'react';
import { useProfile, AVATAR_OPTIONS } from '../context/ProfileContext';
import { useLocale } from '../context/LocaleContext';
import { ViewingProfile } from '../types';
import { X, Plus, Shield, Lock, Trash2, Check, UserCheck, Baby } from 'lucide-react';

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentProfile, profiles, switchProfile, createProfile, deleteProfile } = useProfile();
  const { t } = useLocale();

  const [isAdding, setIsAdding] = useState(false);
  const [pinTargetProfile, setPinTargetProfile] = useState<ViewingProfile | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Form states for adding
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isKids, setIsKids] = useState(false);
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const handleSelectProfile = (profile: ViewingProfile) => {
    if (profile.id === currentProfile?.id) {
      onClose();
      return;
    }

    if (profile.pin) {
      setPinTargetProfile(profile);
      setPinInput('');
      setPinError('');
      return;
    }

    switchProfile(profile);
    onClose();
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinTargetProfile) return;

    const ok = switchProfile(pinTargetProfile, pinInput);
    if (ok) {
      setPinTargetProfile(null);
      setPinInput('');
      onClose();
    } else {
      setPinError(t('incorrect_pin'));
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await createProfile({
      name: newName.trim(),
      avatarUrl: newAvatar,
      isKids,
      pin: newPin.trim() || undefined,
      language: 'en',
    });

    setIsAdding(false);
    setNewName('');
    setNewPin('');
    setIsKids(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#111319] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PIN Entry View */}
        {pinTargetProfile ? (
          <form onSubmit={handleConfirmPin} className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full mx-auto border-2 border-red-500 overflow-hidden shadow-lg shadow-red-500/20">
              <img src={pinTargetProfile.avatarUrl} alt={pinTargetProfile.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {t('enter_pin')}
              </h3>
              <p className="text-xs text-zinc-400">
                Unlock profile for <span className="text-white font-medium">{pinTargetProfile.name}</span>
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError('');
                }}
                autoFocus
                placeholder="••••"
                className="w-full text-center tracking-[1em] text-2xl font-mono py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              {pinError && <p className="text-xs text-red-500 mt-2 font-medium">{pinError}</p>}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setPinTargetProfile(null)}
                className="px-5 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800/80 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={pinInput.length !== 4}
                className="px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-red-600/30 transition"
              >
                Unlock
              </button>
            </div>
          </form>
        ) : isAdding ? (
          /* Add Profile Form */
          <form onSubmit={handleCreateNew} className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">{t('add_profile')}</h3>
              <p className="text-xs text-zinc-400">Create a personalized profile for anyone in your household.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Profile Name</label>
              <input
                type="text"
                required
                maxLength={24}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Maya, John, or Movie Night"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Choose Avatar</label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewAvatar(url)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      newAvatar === url ? 'border-red-500 ring-2 ring-red-500/50 scale-105' : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <img src={url} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Kids Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{t('kids_only')}</h4>
                  <p className="text-xs text-zinc-400">Only displays titles rated for age 12 and under.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isKids}
                onChange={(e) => setIsKids(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
              />
            </div>

            {/* Optional PIN */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Optional 4-Digit Security PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Leave blank for no PIN"
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-white bg-zinc-800 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/30 transition"
              >
                {t('save')}
              </button>
            </div>
          </form>
        ) : (
          /* Profile Selector Grid */
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white">{t('nav_switch_profile')}</h2>
              <p className="text-xs text-zinc-400 mt-1">Select a profile to customize your watch recommendations.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {profiles.map((p) => {
                const isActive = p.id === currentProfile?.id;
                return (
                  <div
                    key={p.id}
                    className={`group relative flex flex-col items-center p-4 rounded-2xl border transition text-center cursor-pointer ${
                      isActive
                        ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/50'
                    }`}
                    onClick={() => handleSelectProfile(p)}
                  >
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-3 border border-zinc-700 group-hover:scale-105 transition">
                      <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                      {p.isKids && (
                        <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          KIDS
                        </div>
                      )}
                      {p.pin && (
                        <div className="absolute top-1 right-1 bg-black/70 p-1 rounded-md text-amber-400">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-red-400 transition truncate w-full">
                      {p.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] text-red-400 font-semibold mt-0.5">Active</span>
                    )}

                    {/* Delete button (if more than 1 profile and not primary active) */}
                    {profiles.length > 1 && !isActive && (
                      <button
                        title="Delete profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete profile "${p.name}"?`)) {
                            deleteProfile(p.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute bottom-2 right-2 p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Profile button */}
              {profiles.length < 5 && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-zinc-700 hover:border-red-500 bg-zinc-900/40 hover:bg-red-500/5 transition text-zinc-400 hover:text-red-400 group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-dashed border-zinc-700 group-hover:border-red-500 flex items-center justify-center mb-3">
                    <Plus className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold">{t('add_profile')}</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                {currentProfile?.isKids ? 'Kids Safety Filter Active' : 'All-Ages Standard Mode'}
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
