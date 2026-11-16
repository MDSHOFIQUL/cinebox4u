import React, { useState } from 'react';
import {
  FileCode,
  Download,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Code2,
  FileCheck,
  Sparkles,
  Server,
  Layers,
  Smartphone,
  Monitor,
} from 'lucide-react';

export const ManageHtmlFile: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loadingCode, setLoadingCode] = useState(false);

  const htmlFilePath = '/cinebox4u_full_website.html';

  const handleCopyCode = async () => {
    try {
      if (!htmlContent) {
        setLoadingCode(true);
        const res = await fetch(htmlFilePath);
        const text = await res.text();
        setHtmlContent(text);
        await navigator.clipboard.writeText(text);
      } else {
        await navigator.clipboard.writeText(htmlContent);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy HTML code:', err);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleToggleCodePreview = async () => {
    if (!showCodePreview && !htmlContent) {
      setLoadingCode(true);
      try {
        const res = await fetch(htmlFilePath);
        const text = await res.text();
        setHtmlContent(text);
      } catch (err) {
        console.error('Failed to load HTML preview:', err);
      } finally {
        setLoadingCode(false);
      }
    }
    setShowCodePreview(!showCodePreview);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider">
              🔒 এডমিন এক্সক্লুসিভ
            </span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-xs text-amber-400 font-bold">
              ইউজার প্যানেলে সম্পূর্ণ লুকানো
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileCode className="w-6 h-6 text-red-500" />
            <span>স্ট্যান্ডঅ্যালোন HTML ফাইল ম্যানেজমেন্ট</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            সম্পূর্ণ ওয়েবসাইটটি একটি একক автономный <code className="text-amber-400 font-mono">cinebox4u_full_website.html</code> ফাইলে সংরক্ষিত। সাধারণ কোনো ইউজার এটি দেখতে বা ডাউনলোড করতে পারবে না—শুধুমাত্র এডমিন প্যানেল থেকে আপনি এটি পরিচালনা ও ডাউনলোড করতে পারবেন।
          </p>
        </div>

        {/* Quick Action Download Button */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={htmlFilePath}
            download="cinebox4u_full_website.html"
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-xl shadow-red-950/80 transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>HTML ফাইল ডাউনলোড</span>
          </a>
        </div>
      </div>

      {/* Security & Access Restriction Notice */}
      <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-emerald-300">
            সিকিউরিটি ও প্রাইভেসি কনফিগারেশন সক্রিয়:
          </p>
          <p className="text-zinc-300">
            পাবলিক নেভবার এবং ইউজার সেটিংস থেকে HTML ফাইলের সমস্ত লিঙ্ক ও বাটন মুছে ফেলা হয়েছে। সাধারণ কোনো ভিজিটর বা ইউজার সাইট ব্রাউজ করার সময় এটি দেখতে পাবে না।
          </p>
        </div>
      </div>

      {/* File Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-1.5">
          <div className="text-zinc-400 text-xs font-semibold flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            ফাইল নেম
          </div>
          <p className="text-sm font-mono font-bold text-white truncate">
            cinebox4u_full_website.html
          </p>
          <span className="text-[10px] text-zinc-500 block">একক সম্পূর্ণ HTML5 ফাইল</span>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-1.5">
          <div className="text-zinc-400 text-xs font-semibold flex items-center gap-1.5">
            <Server className="w-4 h-4 text-amber-400" />
            ডাউনলোড রেজ্যুলেশন
          </div>
          <p className="text-sm font-bold text-white">
            ৭টি কোয়ালিটি (144p - 4K)
          </p>
          <span className="text-[10px] text-zinc-500 block">GDrive ও MEGA ডিরেক্ট লিঙ্ক</span>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-1.5">
          <div className="text-zinc-400 text-xs font-semibold flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-sky-400" />
            ডিসপ্লে মোড
          </div>
          <p className="text-sm font-bold text-white">
            ফোন ও কম্পিউটার ভিউ
          </p>
          <span className="text-[10px] text-zinc-500 block">বড় / ছোট / নরমাল স্কেলিং</span>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-1.5">
          <div className="text-zinc-400 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            স্টাইল ও কাঠামো
          </div>
          <p className="text-sm font-bold text-white">
            CineBox4u
          </p>
          <span className="text-[10px] text-zinc-500 block">Toxic Hero ও লেটেস্ট রিলিজ</span>
        </div>
      </div>

      {/* Admin Action Buttons */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>এডমিন অপারেশন ও টুলস</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download */}
          <a
            href={htmlFilePath}
            download="cinebox4u_full_website.html"
            className="p-4 rounded-2xl bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-red-500 text-white transition flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">ডাউনলোড করুন</p>
              <p className="text-[11px] text-zinc-400">লোকাল পিসিতে সেভ করুন</p>
            </div>
          </a>

          {/* Live Preview in new tab */}
          <a
            href={htmlFilePath}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500 text-white transition flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition shrink-0">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">নতুন ট্যাবে ওপেন</p>
              <p className="text-[11px] text-zinc-400">সরাসরি ব্রাউজারে প্রিভিউ</p>
            </div>
          </a>

          {/* Copy Full Source Code */}
          <button
            onClick={handleCopyCode}
            disabled={loadingCode}
            className="p-4 rounded-2xl bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500 text-white transition flex items-center gap-3 group cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition shrink-0">
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {copied ? 'কোড কপি হয়েছে!' : 'সম্পূর্ণ কোড কপি করুন'}
              </p>
              <p className="text-[11px] text-zinc-400">
                {loadingCode ? 'লোড হচ্ছে...' : 'ক্লিপবোর্ডে কপি হবে'}
              </p>
            </div>
          </button>
        </div>

        {/* Toggle Code Inspector Preview */}
        <div className="pt-2">
          <button
            onClick={handleToggleCodePreview}
            className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-sky-400" />
            <span>{showCodePreview ? 'কোড প্রিভিউ লুকান' : 'এডমিন কোড প্রিভিউ দেখুন'}</span>
          </button>

          {showCodePreview && (
            <div className="mt-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 max-h-96 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[11px] text-zinc-500">
                <span>cinebox4u_full_website.html (Source Preview)</span>
                <span>{htmlContent ? `${htmlContent.length} characters` : 'Loading...'}</span>
              </div>
              <pre className="whitespace-pre-wrap break-all text-[11px] leading-relaxed text-zinc-400">
                {htmlContent || 'কোড লোড হচ্ছে...'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
