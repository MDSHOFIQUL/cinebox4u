import React, { createContext, useContext, useState, useEffect } from 'react';
import { ViewingProfile } from '../types';
import { useAuth } from './AuthContext';
import { fetchViewingProfiles, saveViewingProfile, deleteViewingProfile as deleteProfileApi } from '../services/dataService';

export const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
];

interface ProfileContextType {
  currentProfile: ViewingProfile | null;
  profiles: ViewingProfile[];
  loading: boolean;
  switchProfile: (profile: ViewingProfile, enteredPin?: string) => boolean;
  createProfile: (profileData: { name: string; avatarUrl: string; isKids: boolean; pin?: string; language: string }) => Promise<ViewingProfile>;
  updateProfile: (id: string, updates: Partial<ViewingProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  isProfileLocked: (profile: ViewingProfile) => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ViewingProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ViewingProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Default guest profile when not logged in
  const defaultGuestProfile: ViewingProfile = {
    id: 'guest-profile',
    userId: 'guest',
    name: 'Guest Explorer',
    avatarUrl: AVATAR_OPTIONS[0],
    isKids: false,
    language: 'en',
    createdAt: new Date().toISOString(),
  };

  useEffect(() => {
    if (!user) {
      setProfiles([defaultGuestProfile]);
      setCurrentProfile(defaultGuestProfile);
      return;
    }

    const loadProfiles = async () => {
      setLoading(true);
      try {
        const list = await fetchViewingProfiles(user.uid);
        if (list && list.length > 0) {
          setProfiles(list);
          const savedId = localStorage.getItem(`cinebox4u_active_profile_${user.uid}`);
          const matched = list.find((p) => p.id === savedId) || list[0];
          setCurrentProfile(matched);
        } else {
          // Create default primary profile
          const primary: ViewingProfile = {
            id: `prof_${Date.now()}_primary`,
            userId: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'My Profile',
            avatarUrl: user.photoURL || AVATAR_OPTIONS[0],
            isKids: false,
            language: 'en',
            createdAt: new Date().toISOString(),
          };
          await saveViewingProfile(user.uid, primary);
          setProfiles([primary]);
          setCurrentProfile(primary);
        }
      } catch (err) {
        console.warn('Error loading user profiles, using local fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [user?.uid]);

  const switchProfile = (profile: ViewingProfile, enteredPin?: string): boolean => {
    if (profile.pin) {
      if (enteredPin !== profile.pin) {
        return false;
      }
    }
    setCurrentProfile(profile);
    if (user) {
      localStorage.setItem(`cinebox4u_active_profile_${user.uid}`, profile.id);
    }
    return true;
  };

  const createProfile = async (data: { name: string; avatarUrl: string; isKids: boolean; pin?: string; language: string }): Promise<ViewingProfile> => {
    const userId = user?.uid || 'guest';
    const newProf: ViewingProfile = {
      id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: data.name,
      avatarUrl: data.avatarUrl || AVATAR_OPTIONS[profiles.length % AVATAR_OPTIONS.length],
      isKids: data.isKids,
      pin: data.pin || undefined,
      language: data.language || 'en',
      createdAt: new Date().toISOString(),
    };

    if (user) {
      await saveViewingProfile(userId, newProf);
    }
    setProfiles((prev) => [...prev, newProf]);
    return newProf;
  };

  const updateProfile = async (id: string, updates: Partial<ViewingProfile>) => {
    const updatedList = profiles.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProfiles(updatedList);
    const target = updatedList.find((p) => p.id === id);
    if (target && user) {
      await saveViewingProfile(user.uid, target);
    }
    if (currentProfile?.id === id && target) {
      setCurrentProfile(target);
    }
  };

  const deleteProfile = async (id: string) => {
    if (profiles.length <= 1) return; // Keep at least one profile
    if (user) {
      await deleteProfileApi(user.uid, id);
    }
    const filtered = profiles.filter((p) => p.id !== id);
    setProfiles(filtered);
    if (currentProfile?.id === id) {
      setCurrentProfile(filtered[0]);
    }
  };

  const isProfileLocked = (profile: ViewingProfile): boolean => {
    return Boolean(profile.pin && profile.pin.trim().length > 0);
  };

  return (
    <ProfileContext.Provider
      value={{
        currentProfile: currentProfile || defaultGuestProfile,
        profiles,
        loading,
        switchProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        isProfileLocked,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
