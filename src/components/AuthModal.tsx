import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, Film, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendPasswordReset,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const isRegister = authModalMode === 'register';
  const isForgotPassword = authModalMode === 'forgot_password';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        if (!email.trim()) throw new Error('দয়া করে আপনার জিমেইল বা ইমেইল ঠিকানা দিন');
        await sendPasswordReset(email);
        setSuccessMsg(`✓ পাসওয়ার্ড রিসেট লিংক সফলভাবে পাঠানো হয়েছে! আপনার ${email} ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।`);
      } else if (isRegister) {
        if (!name.trim()) throw new Error('দয়া করে আপনার পূর্ণ নাম লিখুন');
        if (password.length < 6) throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
        await registerWithEmail(name, email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      const code = err.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      } else if (code === 'auth/user-not-found') {
        setErrorMsg('এই জিমেইল দিয়ে কোনো CineBox4u অ্যাকাউন্ট পাওয়া যায়নি।');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('এই জিমেইল ইতিমধ্যে নিবন্ধিত। অনুগ্রহ করে লগ ইন করুন।');
      } else {
        setErrorMsg(err.message || 'অথেন্টিকেশন ব্যর্থ হয়েছে। ক্রেডেনশিয়াল যাচাই করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Google Sign-In বাতিল হয়েছে বা সমস্যা দেখা দিয়েছে।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#111218] border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-white">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-950/60">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            {isForgotPassword
              ? 'পাসওয়ার্ড রিসেট করুন'
              : isRegister
              ? 'Create CineBox4u Account'
              : 'Welcome to CineBox4u'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {isForgotPassword
              ? 'আপনার জিমেইল ঠিকানা দিন, আমরা একটি গোপন পাসওয়ার্ড রিসেট লিংক পাঠাব'
              : isRegister
              ? 'Join to track watch history, create watchlists, and stream in 4K'
              : 'Sign in to access your synchronized stream progress & favorites'}
          </p>
        </div>

        {/* Google Single Sign-On Button (Only on Login/Register) */}
        {!isForgotPassword && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 font-semibold text-xs flex items-center justify-center gap-3 transition mb-4 shadow-sm hover:border-zinc-500 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Google (Gmail)</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center mb-4">
              <div className="grow border-t border-zinc-800"></div>
              <span className="shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                অথবা জিমেইল ও পাসওয়ার্ড দিয়ে
              </span>
              <div className="grow border-t border-zinc-800"></div>
            </div>
          </>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                ইউজারের নাম (User Name)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: Shofiqul Islam"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                />
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              জিমেইল নাম (Gmail / Email)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@gmail.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  জিমেইল পাসওয়ার্ড (Password)
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('forgot_password');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                  >
                    ফরগেট পাসওয়ার্ড?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white cursor-pointer"
                  title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-red-950/80 transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? 'প্রসেসিং হচ্ছে...'
              : isForgotPassword
              ? 'রিসেট লিংক পাঠান (Send Reset Link)'
              : isRegister
              ? 'রেজিস্ট্রেশন সম্পন্ন করুন'
              : 'লগ ইন করুন (Sign In)'}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-5 text-center text-xs text-zinc-400">
          {isForgotPassword ? (
            <p>
              পাসওয়ার্ড মনে পড়েছে?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-red-400 hover:text-red-300 font-bold ml-1 cursor-pointer"
              >
                লগ ইন করুন
              </button>
            </p>
          ) : isRegister ? (
            <p>
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-red-400 hover:text-red-300 font-bold ml-1 cursor-pointer"
              >
                লগ ইন করুন
              </button>
            </p>
          ) : (
            <p>
              অ্যাকাউন্ট নেই?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-red-400 hover:text-red-300 font-bold ml-1 cursor-pointer"
              >
                নতুন অ্যাকাউন্ট তৈরি করুন
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
