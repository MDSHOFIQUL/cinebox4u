import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, Eye, EyeOff, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  onBackToSite: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToSite, onLoginSuccess }) => {
  const { loginWithEmail, loginWithGoogle, user, isAdmin, isEditor, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Strict Admin authorization check
    if (cleanEmail !== 'imdshofiqul863@gmail.com') {
      setErrorMsg('Access Denied: শুধুমাত্র অ্যাডমিন ইমেইল দিয়ে লগইন করলেই কেবল অ্যাডমিন প্যানেল এক্সেস হবে। সাধারণ ইউজার বা অন্য কোনো ইমেইলের জন্য এই পোর্টাল সম্পূর্ণ নিষিদ্ধ।');
      setLoading(false);
      return;
    }

    try {
      await loginWithEmail(cleanEmail, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Admin login error:', err);
      const code = err.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Invalid administrator credentials.');
      } else if (code === 'auth/user-not-found') {
        setErrorMsg('No administrator account associated with this email.');
      } else {
        setErrorMsg(err.message || 'Administrator authorization failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAdmin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      if (user && user.email?.toLowerCase() !== 'imdshofiqul863@gmail.com') {
        setErrorMsg('Access Denied: এই গুগল অ্যাকাউন্টটি অ্যাডমিন হিসেবে অনুমোদিত নয়।');
        return;
      }
      onLoginSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Google Admin authentication was interrupted.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient red glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0e0f14] border border-zinc-800 rounded-3xl p-8 shadow-2xl text-white">
        {/* Back to site button */}
        <button
          onClick={onBackToSite}
          className="mb-6 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to CineBox4u</span>
        </button>

        {/* Admin Badge Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-800 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-red-950/80 border border-red-500/40">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">CineBox4u Admin Portal</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Restricted area. Server-side role authorization required.
          </p>
        </div>

        {/* If already logged in but not admin */}
        {user && !isAdmin && !isEditor && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold">Access Denied</p>
              <p className="text-[11px] mt-0.5">
                Current account ({user.email}) does not possess Super Admin, Admin, or Editor privileges.
              </p>
            </div>
          </div>
        )}

        {/* If already logged in as Admin */}
        {user && (isAdmin || isEditor) && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-bold">Authorized: {(role || 'admin').toUpperCase()}</p>
              <p className="text-[11px] mt-0.5">You are signed in as {user.email}.</p>
              <button
                onClick={onLoginSuccess}
                className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
              >
                Proceed to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Admin Login */}
        <button
          type="button"
          onClick={handleGoogleAdmin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 font-bold text-xs flex items-center justify-center gap-3 transition mb-4 shadow-sm hover:border-red-500/40"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Admin Google Single Sign-On</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="grow border-t border-zinc-800"></div>
          <span className="shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
            Or Admin Email & Password
          </span>
          <div className="grow border-t border-zinc-800"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Admin Email"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wider uppercase shadow-xl shadow-red-950/80 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verifying Credentials...' : 'Authenticate as Administrator'}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 text-center text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-4">
          <p className="font-semibold text-zinc-400">🔒 CineBox4u High-Security Role-Based Protection</p>
          <p className="mt-1">সকল এডমিন অ্যাক্সেস ও পরিবর্তন সার্ভার-সাইড অডিট লগে সুরক্ষিত থাকে।</p>
        </div>
      </div>
    </div>
  );
};
