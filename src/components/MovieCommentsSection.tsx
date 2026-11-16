import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Send,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight,
  Smartphone,
  Monitor,
  Tv,
  Trash2,
  Sparkles,
  Smile,
  Clock,
  ArrowUpDown,
  Shield,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

interface ReplyItem {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
  device: 'mobile' | 'desktop' | 'tv';
}

interface CommentItem {
  id: string;
  mediaId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  text: string;
  device: 'mobile' | 'desktop' | 'tv';
  timestamp: string;
  createdAt?: string;
  likes: number;
  dislikes?: number;
  replies?: ReplyItem[];
}

interface MovieCommentsSectionProps {
  mediaId: string;
  mediaTitle: string;
}

export const MovieCommentsSection: React.FC<MovieCommentsSectionProps> = ({
  mediaId,
  mediaTitle,
}) => {
  const { user, isAdmin, openAuthModal } = useAuth();

  // Detect user's current device
  const getDeviceType = (): 'mobile' | 'desktop' | 'tv' => {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/smart-tv|googletv|appletv|hbbtv|pov_tv|netcast.tv/.test(ua)) return 'tv';
    if (/mobile|android|iphone|ipad|phone/.test(ua) || window.innerWidth < 768) return 'mobile';
    return 'desktop';
  };

  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const saved = localStorage.getItem(`cinebox4u_comments_${mediaId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'c1',
        mediaId,
        userName: 'Tanvir Hossain',
        rating: 5,
        text: 'অসাধারণ 4K পিকচার ও Dolby Atmos সাউন্ড কোয়ালিটি! MEGA ও Google Drive সার্ভার থেকে ফুল স্পিডে ডাউনলোড হয়ে গেল। CineBox4u সেরা!',
        device: 'mobile',
        timestamp: '১০ মিনিট আগে',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        likes: 24,
        dislikes: 0,
        replies: [
          {
            id: 'r1',
            userName: 'Admin CineBox4u',
            text: 'ধন্যবাদ তানভীর ভাই! সাথে থাকুন, সামনে আরও দারুণ সব 4K রিলিজ আসছে।',
            timestamp: '৫ মিনিট আগে',
            device: 'desktop',
          },
        ],
      },
      {
        id: 'c2',
        mediaId,
        userName: 'Shakil Ahmed',
        rating: 5,
        text: 'সরাসরি ১-ক্লিকে 1080p HEVC ডাউনলোড অপশনটা দারুণ কাজ করেছে। IDM দিয়ে কোনো সমস্যা ছাড়াই নামিয়ে সরাসরি গ্যালারিতে পেয়েছি।',
        device: 'desktop',
        timestamp: '১ ঘন্টা আগে',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likes: 18,
        dislikes: 1,
        replies: [],
      },
    ];
  });

  const [name, setName] = useState(user?.displayName || '');
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'likes'>('newest');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user]);

  // Sync with Firestore if available, fallback to localStorage
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('mediaId', '==', mediaId),
        orderBy('createdAt', 'desc')
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const loaded: CommentItem[] = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as any),
            }));
            setComments(loaded);
          }
        },
        (err) => {
          console.warn('Firestore comments snapshot fallback:', err.message);
        }
      );
      return () => unsub();
    } catch {}
  }, [mediaId]);

  const saveLocalComments = (updated: CommentItem[]) => {
    setComments(updated);
    try {
      localStorage.setItem(`cinebox4u_comments_${mediaId}`, JSON.stringify(updated));
    } catch {}
  };

  const handleAddEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    const newComment: CommentItem = {
      id: `comm_${Date.now()}`,
      mediaId,
      userName: name.trim() || user?.displayName || user?.email?.split('@')[0] || 'CineBox Viewer',
      userEmail: user?.email || undefined,
      rating,
      text: text.trim(),
      device: getDeviceType(),
      timestamp: 'এইমাত্র',
      createdAt: new Date().toISOString(),
      likes: 1,
      dislikes: 0,
      replies: [],
    };

    const updated = [newComment, ...comments];
    saveLocalComments(updated);
    setText('');

    // Attempt firestore background persistence
    try {
      await addDoc(collection(db, 'comments'), {
        ...newComment,
        createdAt: new Date().toISOString(),
        userId: user?.uid || 'anonymous',
      });
    } catch {}

    setIsSubmitting(false);
  };

  const handleLike = (id: string) => {
    const updated = comments.map((c) =>
      c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c
    );
    saveLocalComments(updated);
  };

  const handleDislike = (id: string) => {
    const updated = comments.map((c) =>
      c.id === id ? { ...c, dislikes: (c.dislikes || 0) + 1 } : c
    );
    saveLocalComments(updated);
  };

  const handleDeleteComment = (commentId: string) => {
    if (!window.confirm('আপনি কি এই মন্তব্যটি মুছে ফেলতে চান? (Admin Action)')) return;
    const updated = comments.filter((c) => c.id !== commentId);
    saveLocalComments(updated);
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    const newReply: ReplyItem = {
      id: `rep_${Date.now()}`,
      userName: user?.displayName || name.trim() || 'CineBox Fan',
      text: replyText.trim(),
      timestamp: 'এইমাত্র',
      device: getDeviceType(),
    };

    const updated = comments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply],
        };
      }
      return c;
    });

    saveLocalComments(updated);
    setReplyText('');
    setActiveReplyId(null);
  };

  const renderDeviceBadge = (device: 'mobile' | 'desktop' | 'tv') => {
    if (device === 'mobile') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/50">
          <Smartphone className="w-3 h-3 text-red-400" />
          <span>মোবাইল</span>
        </span>
      );
    }
    if (device === 'tv') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/50">
          <Tv className="w-3 h-3 text-amber-400" />
          <span>স্মার্ট টিভি</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/50">
        <Monitor className="w-3 h-3 text-sky-400" />
        <span>কম্পিউটার</span>
      </span>
    );
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div id="comments-discussion-section" className="bg-[#101117] border border-zinc-800 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-red-950/60 shrink-0">
            <MessageSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
                Join the Discussion
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                {comments.length} মন্তব্য
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              "{mediaTitle}" সম্পর্কে আপনার রিভিউ দিন এবং অন্যান্য দর্শকদের সাথে আলোচনা করুন
            </p>
          </div>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <span className="text-[11px] text-zinc-500 px-2 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            <span>সর্ট:</span>
          </span>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              sortBy === 'newest'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            সর্বশেষ
          </button>
          <button
            onClick={() => setSortBy('likes')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              sortBy === 'likes'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            সর্বোচ্চ লাইক
          </button>
        </div>
      </div>

      {/* Authenticated / Guest User Info Banner */}
      {!user && (
        <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>লগইন করলে আপনার প্রোফাইল ব্যাজ ও রেটিং নিরাপদে সংরক্ষিত থাকবে</span>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>লগ ইন করুন</span>
          </button>
        </div>
      )}

      {/* New Comment Form */}
      <form
        onSubmit={handleSubmitComment}
        className="p-5 bg-zinc-950/90 rounded-2xl border border-zinc-800/90 space-y-4 shadow-inner"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* User Name */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">
              আপনার নাম (Name) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: তানভীর চৌধুরী"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
            />
          </div>

          {/* 1-5 Star Rating */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">
              মুভির রেটিং দিন (Rating) *
            </label>
            <div className="flex items-center gap-2 h-9">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-black text-amber-400 ml-2">
                {rating}.0 / 5.0
              </span>
            </div>
          </div>
        </div>

        {/* Comment Textarea */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-300 mb-1">
            আপনার মন্তব্য লিখুন (Comment & Review) *
          </label>
          <textarea
            required
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="মুভির ডাউনলোড স্পিড, প্রিন্ট ও সাউন্ড কেমন লাগলো? কোনো সমস্যা বা ভালো লাগার কথা শেয়ার করুন..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500 resize-none"
          />
        </div>

        {/* Quick Emoji Bar & Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800">
            <span className="text-[11px] text-zinc-500 mr-1 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5" />
              <span>ইমোজি:</span>
            </span>
            {['🔥', '❤️', '👏', '🍿', '🎬', '👌', '⭐', '⚡'].map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => handleAddEmoji(emoji)}
                className="hover:scale-125 transition p-1 text-sm cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs shadow-lg shadow-red-950/60 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'পোস্ট হচ্ছে...' : 'মন্তব্য প্রকাশ করুন'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.map((comment, idx) => (
          <div
            key={`comm-${comment.id || idx}`}
            className="p-4 sm:p-5 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl space-y-3 hover:border-zinc-700 transition"
          >
            {/* Comment Author Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 border border-amber-400/40 flex items-center justify-center text-xs font-black text-white shadow-md">
                  {((comment.userName || 'U')[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {comment.userName}
                    </span>
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: comment.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{comment.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Device Badge */}
                {renderDeviceBadge(comment.device)}

                {/* Admin Delete Moderation Button */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                    title="Delete Comment (Admin Moderation)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Comment Content */}
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-12">
              {comment.text}
            </p>

            {/* Actions: Like, Dislike & Reply */}
            <div className="flex items-center gap-4 pl-12 pt-1 text-xs font-semibold">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 transition cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>লাইক ({comment.likes || 0})</span>
              </button>

              <button
                onClick={() => handleDislike(comment.id)}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition cursor-pointer"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>ডিসলাইক ({comment.dislikes || 0})</span>
              </button>

              <button
                onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-red-500" />
                <span>উত্তর দিন (Reply)</span>
              </button>
            </div>

            {/* Threaded Reply Input */}
            {activeReplyId === comment.id && (
              <div className="pl-12 pt-2 flex items-center gap-2 animate-fadeIn">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="আপনার উত্তর লিখুন..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                />
                <button
                  onClick={() => handleAddReply(comment.id)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  পাঠান
                </button>
              </div>
            )}

            {/* Threaded Replies List */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="pl-12 space-y-2.5 pt-2 border-t border-zinc-800/60 mt-2">
                {comment.replies.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-3"
                  >
                    <CornerDownRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">{rep.userName}</span>
                        {renderDeviceBadge(rep.device)}
                      </div>
                      <p className="text-xs text-zinc-300 mt-1">{rep.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
