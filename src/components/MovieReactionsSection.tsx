import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Flame, Smile, ThumbsUp } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

interface MovieReactionsSectionProps {
  mediaId: string;
  mediaTitle: string;
  initialReactions?: {
    fire?: number;
    loved?: number;
    thanks?: number;
    wow?: number;
    sad?: number;
  };
}

export const MovieReactionsSection: React.FC<MovieReactionsSectionProps> = ({
  mediaId,
  mediaTitle,
  initialReactions,
}) => {
  const [reactions, setReactions] = useState<{
    fire: number;
    loved: number;
    thanks: number;
    wow: number;
    sad: number;
  }>(() => {
    try {
      const saved = localStorage.getItem(`cinebox4u_reactions_${mediaId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fire: initialReactions?.fire || 215,
      loved: initialReactions?.loved || 184,
      thanks: initialReactions?.thanks || 92,
      wow: initialReactions?.wow || 147,
      sad: initialReactions?.sad || 6,
    };
  });

  const [userSelectedReaction, setUserSelectedReaction] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`cinebox4u_user_reaction_${mediaId}`);
    } catch {
      return null;
    }
  });

  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);

  const reactionButtons = [
    {
      id: 'fire',
      emoji: '🔥',
      label: 'Excellent',
      bengaliLabel: 'অসাধারণ',
      count: reactions.fire,
      color: 'from-amber-500 to-red-500',
      border: 'border-amber-500/40',
      bgActive: 'bg-amber-500/20 text-amber-300 border-amber-500',
    },
    {
      id: 'loved',
      emoji: '😍',
      label: 'Loved',
      bengaliLabel: 'ভালোবাসা',
      count: reactions.loved,
      color: 'from-pink-500 to-rose-500',
      border: 'border-rose-500/40',
      bgActive: 'bg-rose-500/20 text-rose-300 border-rose-500',
    },
    {
      id: 'thanks',
      emoji: '😊',
      label: 'Thanks',
      bengaliLabel: 'ধন্যবাদ',
      count: reactions.thanks,
      color: 'from-emerald-500 to-teal-500',
      border: 'border-emerald-500/40',
      bgActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500',
    },
    {
      id: 'wow',
      emoji: '🤩',
      label: 'Wow',
      bengaliLabel: 'দারুণ',
      count: reactions.wow,
      color: 'from-blue-500 to-indigo-500',
      border: 'border-blue-500/40',
      bgActive: 'bg-blue-500/20 text-blue-300 border-blue-500',
    },
    {
      id: 'sad',
      emoji: '😢',
      label: 'Sad',
      bengaliLabel: 'মন খারাপ',
      count: reactions.sad,
      color: 'from-slate-500 to-zinc-600',
      border: 'border-zinc-700/60',
      bgActive: 'bg-zinc-800 text-zinc-300 border-zinc-500',
    },
  ];

  const handleVote = async (id: string) => {
    // If clicking the same one, do nothing
    if (userSelectedReaction === id) return;

    setAnimatingReaction(id);
    setTimeout(() => setAnimatingReaction(null), 800);

    const prevReaction = userSelectedReaction;
    const updated = { ...reactions };

    if (prevReaction && prevReaction in updated) {
      updated[prevReaction as keyof typeof reactions] = Math.max(0, updated[prevReaction as keyof typeof reactions] - 1);
    }
    updated[id as keyof typeof reactions] = (updated[id as keyof typeof reactions] || 0) + 1;

    setReactions(updated);
    setUserSelectedReaction(id);

    try {
      localStorage.setItem(`cinebox4u_reactions_${mediaId}`, JSON.stringify(updated));
      localStorage.setItem(`cinebox4u_user_reaction_${mediaId}`, id);

      // Try updating in Firestore
      const docRef = doc(db, 'movies', mediaId);
      await updateDoc(docRef, {
        [`reactions.${id}`]: increment(1),
        ...(prevReaction ? { [`reactions.${prevReaction}`]: increment(-1) } : {}),
      });
    } catch {
      // Offline / fallback to local storage handled
    }
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-[#101117] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Did You Like It?</span>
              <span className="text-xs font-normal text-zinc-400">/ আপনার কেমন লেগেছে?</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              মুভিটি দেখার পর আপনার অনুভূতি শেয়ার করুন ও অন্য দর্শকদের রেটিং দিন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/90 px-3.5 py-1.5 rounded-full border border-zinc-800 text-xs font-bold text-zinc-300 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{totalReactions.toLocaleString()} টি মোট প্রতিক্রিয়া</span>
        </div>
      </div>

      {/* 5 Reaction Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {reactionButtons.map((btn) => {
          const isSelected = userSelectedReaction === btn.id;
          const isAnimating = animatingReaction === btn.id;

          return (
            <button
              key={btn.id}
              onClick={() => handleVote(btn.id)}
              className={`relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer group shadow-md ${
                isSelected
                  ? btn.bgActive
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              } ${isAnimating ? 'scale-110' : 'hover:scale-105'}`}
            >
              {/* Emoji Icon */}
              <span className={`text-2xl sm:text-3xl transition-transform duration-200 ${isAnimating ? 'animate-bounce' : 'group-hover:scale-110'}`}>
                {btn.emoji}
              </span>

              {/* Label */}
              <span className="text-xs font-extrabold text-white mt-1.5 tracking-wide">
                {btn.label}
              </span>

              {/* Bengali Sub-label */}
              <span className="text-[10px] text-zinc-400 font-medium">
                {btn.bengaliLabel}
              </span>

              {/* Dynamic Count */}
              <span
                className={`mt-2 text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  isSelected
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-zinc-900 text-amber-400 border-zinc-800 group-hover:border-amber-500/30'
                }`}
              >
                {btn.count.toLocaleString()}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
