import React from 'react';
import { ShieldCheck, CheckCircle2, Sparkles, Gift } from 'lucide-react';

export const SubscriptionManager: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 100% Free Service Status Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#101117] to-zinc-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-black font-black shadow-xl shadow-emerald-950/60 shrink-0">
              <Gift className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  ১০০% সম্পূর্ণ ফ্রি সার্ভিস (100% Free Platform)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase">
                  ACTIVE • NO PAYMENTS
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                CineBox4u একটি সম্পূর্ণ ফ্রি বিনোদন পোর্টাল। কোনো পেইড সাবস্ক্রিপশন, পেমেন্ট গেটওয়ে, বা লুকায়িত চার্জ নেই।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Free Guarantees Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">আনলিমিটেড ফ্রি স্ট্রিমিং</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            সকল ব্যবহারকারী কোনো ফি বা লগইন বাধা ছাড়াই যেকোনো মুভি এবং ওয়েব সিরিজ দেখতে পারবেন।
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">সম্পূর্ণ ফ্রি ফুল স্পিড ডাউনলোড</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            144p থেকে 4K পর্যন্ত সব কোয়ালিটির ফাইল Google Drive ও MEGA দিয়ে সম্পূর্ণ ফ্রিতে ডাউনলোড করা যায়।
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">জিরো পেমেন্ট গেটওয়ে</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            কোনো প্রকার ক্রেডিট কার্ড বা পেমেন্ট গেটওয়ের ঝামেলা নেই। প্ল্যাটফর্মটি ১০০% উন্মুক্ত ও সুরক্ষিত।
          </p>
        </div>
      </div>
    </div>
  );
};
