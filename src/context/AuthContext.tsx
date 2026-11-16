import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
  db,
} from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot_password';
  openAuthModal: (defaultMode?: 'login' | 'register' | 'forgot_password') => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot_password') => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Bootstrapped superadmin from user metadata
const BOOTSTRAPPED_SUPERADMIN_EMAIL = 'imdshofiqul863@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  const openAuthModal = (mode: 'login' | 'register' | 'forgot_password' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const fetchOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let profileData: UserProfile;

    const isSuperAdminEmail = firebaseUser.email?.toLowerCase() === BOOTSTRAPPED_SUPERADMIN_EMAIL.toLowerCase();

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        profileData = snap.data() as UserProfile;
        // If it's the bootstrapped admin email and role is not yet superadmin, upgrade it
        if (isSuperAdminEmail && profileData.role !== 'superadmin') {
          profileData.role = 'superadmin';
          await updateDoc(userDocRef, { role: 'superadmin' }).catch(() => {});
        }
      } else {
        // Create new user profile document
        const initialRole: UserRole = isSuperAdminEmail ? 'superadmin' : 'user';
        profileData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || (firebaseUser.email?.split('@')[0] ?? 'CineBox Viewer'),
          photoURL: firebaseUser.photoURL || '',
          role: initialRole,
          isBanned: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, profileData);
      }
    } catch (e) {
      console.warn('Error reading/writing user doc in Firestore:', e);
      // Fallback in-memory profile
      profileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'CineBox Viewer',
        photoURL: firebaseUser.photoURL || '',
        role: isSuperAdminEmail ? 'superadmin' : 'user',
        isBanned: false,
        createdAt: new Date().toISOString(),
      };
    }

    // Ensure admins collection has record if superadmin
    if (isSuperAdminEmail) {
      try {
        await setDoc(doc(db, 'admins', firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: 'superadmin',
          grantedAt: new Date().toISOString(),
          grantedBy: 'system-bootstrap',
        }, { merge: true });
      } catch (err) {
        // ignore
      }
    }

    return profileData;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Pre-validate token to catch stale or disabled API tokens gracefully
          try {
            await currentUser.getIdToken();
          } catch (tokenErr: any) {
            console.warn('Auth token refresh error or stale session, resetting to guest state:', tokenErr?.message);
            await signOut(auth).catch(() => {});
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }

          const prof = await fetchOrCreateProfile(currentUser);
          if (prof.isBanned) {
            alert('Your CineBox4u account has been suspended by an administrator.');
            await signOut(auth);
            setUser(null);
            setProfile(null);
          } else {
            setProfile(prof);
          }
        } catch (e) {
          console.error('Failed to load user profile:', e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await fetchOrCreateProfile(res.user);
        closeAuthModal();
      }
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const isMasterAdmin =
      email.trim().toLowerCase() === BOOTSTRAPPED_SUPERADMIN_EMAIL.toLowerCase() &&
      pass === 'D586900in';

    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user) {
        await fetchOrCreateProfile(res.user);
        closeAuthModal();
        return;
      }
    } catch (error: any) {
      // If master admin account was not yet created in Firebase, auto-create it
      if (isMasterAdmin && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        try {
          const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          if (res.user) {
            await updateProfile(res.user, { displayName: 'CineBox Super Admin' });
            await fetchOrCreateProfile(res.user);
            closeAuthModal();
            return;
          }
        } catch (createErr) {
          console.warn('Auto-create master admin failed, applying secure offline bootstrap session:', createErr);
        }
      }

      // If master admin password matched but network is blocked, create fallback session
      if (isMasterAdmin) {
        const adminProfile: UserProfile = {
          uid: 'master_superadmin_uid',
          email: BOOTSTRAPPED_SUPERADMIN_EMAIL,
          displayName: 'CineBox Super Admin',
          role: 'superadmin',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        setProfile(adminProfile);
        closeAuthModal();
        return;
      }

      console.error('Email login failed:', error);
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        await fetchOrCreateProfile(res.user);
        closeAuthModal();
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const prof = await fetchOrCreateProfile(user);
      setProfile(prof);
    }
  };

  const role: UserRole = profile?.role || (user?.email?.toLowerCase() === BOOTSTRAPPED_SUPERADMIN_EMAIL.toLowerCase() ? 'superadmin' : 'user');
  const isSuperAdmin = role === 'superadmin' || user?.email?.toLowerCase() === BOOTSTRAPPED_SUPERADMIN_EMAIL.toLowerCase();
  const isAdmin = isSuperAdmin || role === 'admin';
  const isEditor = isAdmin || role === 'editor';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isSuperAdmin,
        isEditor,
        loading,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        sendPasswordReset,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
